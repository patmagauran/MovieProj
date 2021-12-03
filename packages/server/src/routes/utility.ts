import Router from "express-promise-router";
import * as db from "../db";
import { sql } from "../db";
import { from as copyFrom } from "pg-copy-streams";
import fs from "fs";
const router = Router();
import { Transform, TransformCallback, TransformOptions } from "stream";
import { pipeline } from "stream/promises";
import { PoolClient } from "pg";

interface Person {
  id: number;
  name: string;
  age: number;
}

class RemoveHeaders extends Transform {
  private _buff: string;
  private _removed: boolean;

  constructor(options?: TransformOptions) {
    super(options);
    this._buff = "";
    this._removed = false;
    console.log("Created new Remove Header");
  }

  _transform(chunk: any, encoding: any, callback: () => void) {
    if (this._removed) {
      // if already removed
      this.push(chunk); // just push through buffer
    } else {
      // collect string into buffer
      this._buff += chunk.toString();

      // check if string has newline symbol
      if (this._buff.indexOf("\n") !== -1) {
        // push to stream skipping first line
        this.push(this._buff.slice(this._buff.indexOf("\n") + 1));
        // clear string buffer
        this._buff = "";
        // mark as removed
        this._removed = true;
        console.log("Removed Headers. Pushing Data...");
      }
    }
    callback();
    //callback(null, data);
  }
}

async function insertMovies(client: PoolClient) {
  await client.query(
    sql`CREATE TEMP TABLE "import_temp" (LIKE movie_basics INCLUDING GENERATED INCLUDING IDENTITY)`
  );
  console.log("Created Temporary Table. Copying Data In.");

  var stream = client.query(
    copyFrom(
      /* sql */`COPY "import_temp"
          (tconst, title_type, primary_title, 
          original_title, is_adult, start_year, 
          end_year, runtime_minutes, genres) 
          FROM STDIN`
    )
  );
  var fileStream = fs.createReadStream("/home/pat/MovieProj/data/movies.tsv");

  await pipeline(fileStream, new RemoveHeaders(), stream);
  console.log("Data Copied to Temporary Table. Loading Statistics");

  await client.query("ANALYZE import_temp");
  console.log("Data ready for insert. Inserting data into primary table.");
  await client.query(
    sql`
        INSERT INTO movies
        (imdb_id, title_type, english_title, release_year, runtime)
         (SELECT
            tconst,
            (CASE
              WHEN (title_type = 'video') THEN 'video'
              WHEN (title_type = 'tvSeries' OR title_type = 'tvMiniSeries') THEN 'tv_series'
              WHEN (title_type = 'tvShort' OR title_type = 'short') THEN 'short'
              WHEN (title_type IN ('tvMovie', 'movie' )) THEN 'movie' END) as v_type,
            primary_title,
            make_date(start_year,1,1),
            runtime_minutes
          FROM
            import_temp
  	       WHERE import_temp.title_type IN 
            ('video', 'tvSeries', 'tvShort', 'movie', 'tvMovie', 'short', 'tvMiniSeries'))
        ON CONFLICT (imdb_id)
          DO UPDATE SET
            "title_type" = EXCLUDED.title_type,
            "english_title" = EXCLUDED.english_title,
            "release_year" = EXCLUDED.release_year,
            "runtime" = EXCLUDED.runtime
      `
  );
  await client.query(
    sql`
    INSERT INTO genre 
      (genre_name) 
      (SELECT DISTINCT 
        trim(both from string_to_table(genres, ',')) 
      FROM import_temp)
    ON CONFLICT (genre_name) DO NOTHING
    `
  );
  await client.query(
    sql`
    WITH temp_movie_genres AS (
      SELECT id, tconst, trim(both from string_to_table(genres, ',')) as genre FROM import_temp
    )
    INSERT INTO movie_genres 
      (movie, genre) 

      (SELECT movies.id, genre.id
      FROM movies
      INNER JOIN temp_movie_genres
      ON temp_movie_genres.tconst = movies.imdb_id
      INNER JOIN genre
      ON genre.genre_name = temp_movie_genres.genre)
    ON CONFLICT (movie, genre) DO NOTHING
    `
  );
  console.log("Saving Changes - Stage 1");
  await client.query("DROP TABLE import_temp; COMMIT;");
}

async function addRatings(client: PoolClient) {
  await client.query(
    sql`CREATE TEMP TABLE "import_temp" 
    (
      id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      tconst varchar,
      average_rating decimal,
      num_votes integer
    )`
  );
  console.log("Created Temporary Table. Copying Data In.");

  var stream = client.query(
    copyFrom(
      /* sql */`COPY "import_temp"
          (tconst, average_rating, num_votes) 
          FROM STDIN`
    )
  );
  var fileStream = fs.createReadStream("/home/pat/MovieProj/data/ratings.tsv");

  await pipeline(fileStream, new RemoveHeaders(), stream);
  console.log("Data Copied to Temporary Table. Loading Statistics");

  await client.query("ANALYZE import_temp");
  console.log("Data ready for insert. Inserting data into primary table.");
  await client.query(
    sql`
        UPDATE movies
        SET imdb_rating = import_temp.average_rating,
         num_votes = import_temp.num_votes
        FROM import_temp WHERE movies.imdb_id = import_temp.tconst
      `
  );

  console.log("Saving Changes - Stage 1.5");
  await client.query("DROP TABLE import_temp; COMMIT;");
}

async function insertPeople(client: PoolClient) {
  await client.query(
    sql`CREATE TEMP TABLE "import_temp" 
    (
      id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      nconst varchar,
      primary_name varchar,
      birth_year integer,
      death_year integer,
      primary_profession varchar,
      known_for varchar
    )`
  );
  console.log("Created Temporary Table. Copying Data In.");

  var stream = client.query(
    copyFrom(
      /* sql */`COPY "import_temp"
          (nconst, primary_name, birth_year, death_year,
          primary_profession, known_for) 
          FROM STDIN`
    )
  );
  var fileStream = fs.createReadStream("/home/pat/MovieProj/data/names.tsv");

  await pipeline(fileStream, new RemoveHeaders(), stream);
  console.log("Data Copied to Temporary Table. Loading Statistics");

  await client.query("ANALYZE import_temp");
  console.log("Data ready for insert. Inserting data into primary table.");
  await client.query(
    sql`
        INSERT INTO people
        (imdb_id, name)
         (SELECT
            nconst,
            primary_name
          FROM
            import_temp)
        ON CONFLICT (imdb_id)
          DO UPDATE SET
            "name" = EXCLUDED.name
      `
  );

  console.log("Saving Changes - Stage 2");
  await client.query("DROP TABLE import_temp; COMMIT;");
}
async function insertCastAndCrew(client: PoolClient) {
  await client.query(
    sql`CREATE TEMP TABLE "import_temp"
    (
      id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      tconst varchar,
      nconst varchar,
      category varchar,
      job varchar,
      characters varchar,
      ordering integer
    )`
  );
  console.log("Created Temporary Table. Copying Data In.");

  var stream = client.query(
    copyFrom(
      /* sql */`COPY "import_temp"
          (tconst, ordering, nconst, category, job, characters) 
          FROM STDIN`
    )
  );
  var fileStream = fs.createReadStream(
    "/home/pat/MovieProj/data/principals.tsv"
  );

  await pipeline(fileStream, new RemoveHeaders(), stream);
  console.log("Data Copied to Temporary Table. Loading Statistics");

  await client.query("ANALYZE import_temp");
  console.log("Data ready for insert. Inserting data into primary table.");
  console.log("Adding Actors...");
  await client.query(
    sql`
     WITH temp_cast_characters AS (
      SELECT tconst, nconst, category,
	      trim(both '" ' from string_to_table(
		      trim(both '[]' from "characters"), ',')
        ) as character_name
	    FROM import_temp WHERE category IN ('self', 'actress', 'actor')
      )
    INSERT INTO ACTORS_IN_MOVIE (PERSON,MOVIE, CHARACTER_NAME, category)
      (SELECT people.id, movies.id, temp_cast_characters.character_name, temp_cast_characters.category
        FROM movies
        INNER JOIN temp_cast_characters
          ON temp_cast_characters.tconst = movies.imdb_id
        INNER JOIN people
          ON people.imdb_id = temp_cast_characters.nconst)
    ON CONFLICT (person, movie) DO NOTHING`
  );
  console.log("Adding crew...");
  await client.query(
    sql`
    WITH temp_cast_characters AS (
      SELECT tconst, nconst, COALESCE(job, category) as crew_role, category
	    FROM import_temp WHERE category NOT IN ('self', 'actress', 'actor')
      )
    INSERT INTO crew_in_movie (PERSON,MOVIE, "role", category)
      (SELECT people.id, movies.id, temp_cast_characters.crew_role, temp_cast_characters.category
        FROM movies
        INNER JOIN temp_cast_characters
          ON temp_cast_characters.tconst = movies.imdb_id
        INNER JOIN people
          ON people.imdb_id = temp_cast_characters.nconst
      )
    ON CONFLICT (person, movie) DO NOTHING
    `
  );

  console.log("Saving Changes - Stage 3");
  await client.query("DROP TABLE import_temp; COMMIT;");
}
//ADD GROUO BASED AVAILABILITY
router.get("/import", async (request: any, response: any) => {
  // note: we don't try/catch this because if connecting throws an exception
  // we don't need to dispose of the client (it will be undefined)
  const client = await db.getClient();
  try {
    const start = Date.now();

    console.log("Running Import");
    await client.query("BEGIN");
    // await insertMovies(client);
    //await addRatings(client);
    // await insertPeople(client);
    await insertCastAndCrew(client);

    console.log("Done");
    const duration = Date.now() - start;
    console.log("Operation took: " + duration / 1000 + "s");
    response.status(200).json({ stauts: "Success" });
  } catch (e) {
    console.error(e);

    await client.query("ROLLBACK");
    response.status(503).json({ stauts: "Error" });

    throw e;
  } finally {
    client.release();
  }
});
export default router;

import Router from "express-promise-router";
import * as db from "../db";
import { sql } from "../db";
import { from as copyFrom } from "pg-copy-streams";
import fs from "fs";
const router = Router();
import { Transform, TransformCallback, TransformOptions } from "stream";
import { pipeline } from "stream/promises";

interface Person {
  id: number;
  name: string;
  age: number;
}
var _buff = "";
var _removed = false;
const RemoveHeadersTransform = new Transform({
  transform(data, encoding, callback) {
    if (_removed) {
      // if already removed
      this.push(data); // just push through buffer
    } else {
      // collect string into buffer
      _buff += data.toString();

      // check if string has newline symbol
      if (_buff.indexOf("\n") !== -1) {
        // push to stream skipping first line
        this.push(_buff.slice(_buff.indexOf("\n") + 2));
        // clear string buffer
        _buff = "";
        // mark as removed
        _removed = true;
      }
    }
    callback();
    //callback(null, data);
  },
});

router.get("/import", async (request: any, response: any) => {
  // note: we don't try/catch this because if connecting throws an exception
  // we don't need to dispose of the client (it will be undefined)
  const client = await db.getClient();
  try {
    const start = Date.now();

    console.log("Running Import");
    await client.query("BEGIN");
    await client.query(
      sql`CREATE TEMP TABLE "import_test" (LIKE movie_basics INCLUDING GENERATED INCLUDING IDENTITY)`
    );
    console.log("Created Temporary Table. Copying Data In.");

    var stream = client.query(
      copyFrom(
        sql`COPY "import_test" 
          (tconst, title_type, primary_title, 
          original_title, is_adult, start_year, 
          end_year, runtime_minutes, genres) 
          FROM STDIN`
      )
    );
    var fileStream = fs.createReadStream("/home/pat/MovieProj/data/data.tsv");

    await pipeline(fileStream, RemoveHeadersTransform, stream);
    console.log("Data Copied to Temporary Table. Loading Statistics");

    await client.query("ANALYZE import_test");
    console.log("Data ready for insert. Insertting data into primary table.");

    await client.query(
      sql`
        INSERT INTO movie_basics 
        (tconst, title_type, primary_title, original_title, is_adult, start_year, end_year, runtime_minutes, genres)
         (SELECT
            tconst,
            title_type,
            primary_title,
            original_title,
            is_adult,
            start_year,
            end_year,
            runtime_minutes,
            genres
          FROM
            import_test)
        ON CONFLICT (tconst)
          DO UPDATE SET
            "title_type" = EXCLUDED.title_type,
            "primary_title" = EXCLUDED.primary_title,
            "original_title" = EXCLUDED.original_title,
            "is_adult" = EXCLUDED.is_adult,
            "start_year" = EXCLUDED.start_year,
            "end_year" = EXCLUDED.end_year,
            "runtime_minutes" = EXCLUDED.runtime_minutes,
            genres = EXCLUDED.genres
      `
    );
    console.log("Saving Changes");
    await client.query("COMMIT");
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

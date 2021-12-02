import Router from "express-promise-router";
import { verifyUser } from "../authenticate";
import * as db from "../db";
import { sql } from "../db";
const router = Router();

//LIST
router.get("/", async (request: any, response: any) => {
  let pageSize = request.query.pageSize ?? 10;
  let page = request.query.page ?? 0;
  let searchText: string = request.query.searchText ? '%' + request.query.searchText + '%' : '%';
  let offset = (page) * pageSize;
  //let whereClause = searchText ? sql`  WHERE english_title ILIKE '%${searchText}%'` : sql``

  db.restQuery(response, sql`SELECT * FROM movies_list
    WHERE english_title ILIKE ${searchText}
  LIMIT ${pageSize}
  OFFSET ${offset}`);
});

//LIST
router.get("/userMovies", verifyUser, async (request: any, response: any) => {
  let user = request.user;
  let pageSize = request.query.pageSize ?? 10;
  let page = request.query.page ?? 0;
  let searchText: string = request.query.searchText ? '%' + request.query.searchText + '%' : '%';
  let offset = (page) * pageSize;
  //let whereClause = searchText ? sql`  WHERE english_title ILIKE '%${searchText}%'` : sql``

  db.restQuery(response, sql`SELECT 
      movies_list_mv.id,  
      movies_list_mv.english_title,
      movies_list_mv.imdb_rating,
      movies_list_mv.release_year,
      movies_list_mv.runtime,
      movies_list_mv.imdb_id,
      (SELECT COUNT(friends_want_to_see_movies.movie) > 0 FROM friends_want_to_see_movies WHERE friends_want_to_see_movies.user = ${user.id} AND friends_want_to_see_movies.movie = movies_list_mv.id) as wants_to_see,
      (SELECT COUNT(friend_seen_movie.movie) > 0 FROM friend_seen_movie WHERE friend_seen_movie.user = ${user.id} AND friend_seen_movie.movie = movies_list_mv.id) as has_seen
    FROM movies_list_mv
    WHERE english_title ILIKE ${searchText}
  LIMIT ${pageSize}
  OFFSET ${offset}`);
});

router.post("/updateFromTmdb", verifyUser, async (request: any, response: any) => {
  response.send({ status: "Not implemented yet" });
})

router.put("/seenMovie/:id", verifyUser, async (request: any, response: any) =>
  db.restQuery(response, sql`INSERT INTO friend_seen_movie ("user", movie) VALUES (${request.user.id}, ${request.params.id})`)
);
router.put("/wantSeeMovie/:id", verifyUser, async (request: any, response: any) =>
  db.restQuery(response, sql`INSERT INTO friends_want_to_see_movies ("user", movie) VALUES (${request.user.id}, ${request.params.id})`)
);
router.delete("/seenMovie/:id", verifyUser, async (request: any, response: any) =>
  db.restQuery(response, sql`DELETE FROM friend_seen_movie WHERE "user" = ${request.user.id} and movie= ${request.params.id}`)
);
router.delete("/wantSeeMovie/:id", verifyUser, async (request: any, response: any) =>
  db.restQuery(response, sql`DELETE FROM friends_want_to_see_movies WHERE "user" = ${request.user.id} and movie= ${request.params.id}`)
);
//GET
router.get("/:id", async (request: any, response: any) =>
  db.restQuery(response, sql`SELECT * FROM movies WHERE id = ${request.params.id} ORDER BY num_votes DESC NULLS LAST, english_title ASC NULLS LAST`)
);
//CREATE
// router.post("/", async (request: any, response: any) =>
//   db.restQuery(response, sql`INSERT INTO users (name, email) VALUES (${request.body.name}, ${request.body.email})`)
// );
//UPDATE
router.put("/:id", verifyUser, async (request: any, response: any) =>
  db.restQuery(
    response,
    sql`UPDATE movies SET 
    preview_link = ${request.body.preview_link}, 
    description = ${request.body.description},
    poster_link = ${request.body.poster_link},
    language = ${request.body.language} WHERE id = ${request.params.id}`
  )
);
// //DELETE
// router.delete("/:id", async (request: any, response: any) =>
//   db.restQuery(response, sql`DELETE FROM users WHERE id = ${request.params.id}`)
// );

export default router;

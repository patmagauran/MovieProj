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

    db.restQuery(response, sql`SELECT * FROM people_movies
    WHERE "name" ILIKE ${searchText}
  LIMIT ${pageSize}
  OFFSET ${offset}`);
});

//LIST



//CREATE
// router.post("/", async (request: any, response: any) =>
//   db.restQuery(response, sql`INSERT INTO users (name, email) VALUES (${request.body.name}, ${request.body.email})`)
// );
//UPDATE

// //DELETE
// router.delete("/:id", async (request: any, response: any) =>
//   db.restQuery(response, sql`DELETE FROM users WHERE id = ${request.params.id}`)
// );

export default router;

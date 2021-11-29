import Router from "express-promise-router";
import * as db from "../db";
import { sql } from "../db";
const router = Router();

//LIST
router.get("/", async (request: any, response: any) => {
  let pageSize = request.query.pageSize ?? 10;
  let page = request.query.page ?? 0;
  let offset = (page) * pageSize;
  db.restQuery(response, sql`SELECT * FROM movies 
  ORDER BY id ASC 
  LIMIT ${pageSize}
  OFFSET ${offset}`);
});
//GET
router.get("/:id", async (request: any, response: any) =>
  db.restQuery(response, sql`SELECT * FROM users WHERE id = ${request.params.id}`)
);
//CREATE
router.post("/", async (request: any, response: any) =>
  db.restQuery(response, sql`INSERT INTO users (name, email) VALUES (${request.body.name}, ${request.body.email})`)
);
//UPDATE
router.put("/:id", async (request: any, response: any) =>
  db.restQuery(
    response,
    sql`UPDATE users SET name = ${request.body.name}, email = ${request.body.email} WHERE id = ${request.params.id}`
  )
);
//DELETE
router.delete("/:id", async (request: any, response: any) =>
  db.restQuery(response, sql`DELETE FROM users WHERE id = ${request.params.id}`)
);

export default router;

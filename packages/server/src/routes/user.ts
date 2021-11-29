import Router from "express-promise-router";
import * as db from "../db";
import { sql } from "../db";
const router = Router();

//LIST
router.get("/", async (request: any, response: any) => {
  db.restQuery(response, sql`SELECT * FROM users ORDER BY id ASC`);
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

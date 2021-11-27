import Router from "express-promise-router";
import * as db from "../db";
const router = Router();

router.get("/", async (request: any, response: any) => {
  //console.log("hello");
  //response.status(200).json({});
  db.restQuery(response, "SELECT * FROM users ORDER BY id ASC");
});
router.get("/:id", async (request: any, response: any) =>
  db.restQuery(response, "SELECT * FROM users WHERE id = $1", [
    request.params.id,
  ])
);
//CREATE
router.post("/", async (request: any, response: any) =>
  db.restQuery(response, "INSERT INTO users (name, email) VALUES ($1, $2)", [
    request.body.name,
    request.body.email,
  ])
);
//UPDATE
router.put("/:id", async (request: any, response: any) =>
  db.restQuery(
    response,
    "UPDATE users SET name = $1, email = $2 WHERE id = $3",
    [request.body.name, request.body.email, request.params.id]
  )
);
//DELETE
router.delete("/:id", async (request: any, response: any) =>
  db.restQuery(response, "DELETE FROM users WHERE id = $1", [request.params.id])
);

export default router;

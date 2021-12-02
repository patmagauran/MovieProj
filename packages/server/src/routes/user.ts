import Router from "express-promise-router";
import * as db from "../db";
import { sql } from "../db";

const router = Router();
import { verifyUser } from "../authenticate";
import { addAuthRoutes } from "./auth";
import { getErrorMessage } from "../utilities";

addAuthRoutes(router);



router.get("/getUsers", verifyUser, async (request: any, response: any) =>
  db.restQuery(
    response,
    sql`SELECT id, username, (first_name || ' ' || last_name) as full_name from users`
  )
);

router.get("/me", verifyUser, (req, res, next) => {
  res.send(req.user)
})


router.post("/me", verifyUser, async (request: any, response: any) =>
  db.restQuery(
    response,
    sql`UPDATE users SET "username" = ${request.body.username}, first_name = ${request.body.first_name}, last_name = ${request.body.last_name}, email = ${request.body.email} WHERE id = ${request.user.id}`
  )
);

router.get("/allSchedules", verifyUser, async (request, response, next) => {
  let user = request.user;

  //let whereClause = searchText ? sql`  WHERE english_title ILIKE '%${searchText}%'` : sql``

  db.restQuery(response, sql`SELECT 
      lower(time_range) as start_time, upper(time_range) as end_time, id, username, (first_name || ' ' || last_name) as full_name  FROM user_available
      JOIN users ON user_available.user_id = id
`);
})

router.get("/schedule", verifyUser, async (request, response, next) => {
  let user = request.user;

  //let whereClause = searchText ? sql`  WHERE english_title ILIKE '%${searchText}%'` : sql``

  db.restQuery(response, sql`SELECT 
      lower(time_range) as start_time, upper(time_range) as end_time FROM user_available where user_id = ${user.id}
`);
})
router.post("/schedule", verifyUser, async (request, response, next) => {
  let user = request.user;

  //let whereClause = searchText ? sql`  WHERE english_title ILIKE '%${searchText}%'` : sql``

  db.restQuery(response, sql`INSERT INTO user_available (user_id, time_range) VALUES ( ${user.id}, tstzrange(${request.body.start_time}, ${request.body.end_time}))
`);
})

router.put("/schedule", verifyUser, async (request, response, next) => {
  let user = request.user;

  //let whereClause = searchText ? sql`  WHERE english_title ILIKE '%${searchText}%'` : sql``
  try {
    const client = await db.getClient();
    await db.queryWithClient(client, sql`BEGIN`);
    await db.queryWithClient(client, sql`DELETE FROM user_available WHERE 
     time_range = tstzrange(${request.body.old_start_time}, ${request.body.old_end_time}) and user_id = ${user.id}
`);
    await db.queryWithClient(client, sql`INSERT INTO user_available (user_id, time_range) VALUES ( ${user.id}, tstzrange(${request.body.start_time}, ${request.body.end_time}))`);
    await db.queryWithClient(client, sql`COMMIT`);
    response.status(200);
    response.send({ status: "Success" })
  } catch (err) {
    response.status(503);
    response.send({ status: "Error", error: getErrorMessage(err) })
  }

})

router.post("/schedule/delete", verifyUser, async (request, response, next) => {
  let user = request.user;

  //let whereClause = searchText ? sql`  WHERE english_title ILIKE '%${searchText}%'` : sql``

  db.restQuery(response, sql`DELETE FROM user_available WHERE 
     time_range = tstzrange(${request.body.start_time}, ${request.body.end_time}) and user_id = ${user.id}
`);
})

// //LIST
// router.get("/", async (request: any, response: any) => {
//   db.restQuery(response, sql`SELECT * FROM users ORDER BY id ASC`);
// });
// //GET
// router.get("/:id", async (request: any, response: any) =>
//   db.restQuery(response, sql`SELECT * FROM users WHERE id = ${request.params.id}`)
// );
// //CREATE
// router.post("/", async (request: any, response: any) =>
//   db.restQuery(response, sql`INSERT INTO users (name, email) VALUES (${request.body.name}, ${request.body.email})`)
// );
// //UPDATE
// router.put("/:id", async (request: any, response: any) =>
//   db.restQuery(
//     response,
//     sql`UPDATE users SET name = ${request.body.name}, email = ${request.body.email} WHERE id = ${request.params.id}`
//   )
// );
// //DELETE
// router.delete("/:id", async (request: any, response: any) =>
//   db.restQuery(response, sql`DELETE FROM users WHERE id = ${request.params.id}`)
// );

export default router;

// ./app.js
import express from "express";
import mountRoutes from "./routes";
try {
  const app = express();
  const port = 8080; // default port to listen

  app.use(express.json()); //Used to parse JSON bodies
  app.use(express.urlencoded()); //Parse URL-encoded bodies

  app.get("/", (request, response) => {
    response.json({ info: "Node.js, Express, and Postgres API" });
  });
  app.listen(port, () => {
    console.log(`App running on port ${port}.`);
  });
  mountRoutes(app);
} catch (err) {
  console.error(err);
}

// ./app.js
import dotenv from 'dotenv'
if (process.env.NODE_ENV !== "production") {
  // Load environment variables from .env file in non prod environments
  dotenv.config()
}
import express from "express";
import mountRoutes from "./routes";
import cors, { CorsOptions } from "cors"
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import passport from "passport";

import "./strategies/JwtStrategy"
import "./strategies/LocalStrategy"
import "./authenticate"
import { handleError } from './utilities';



export const UNSAFE_PRINT_PARAMS = true;
try {
  if (UNSAFE_PRINT_PARAMS) {
    console.warn("WARNING: ALL QUERY PARAMETERS WILL BE PRINTED. THIS MAY LEAK SENSITIVE INFO!")
  }
  const app = express();
  const port = 8080; // default port to listen
  app.use(express.json()); //Used to parse JSON bodies
  app.use(express.urlencoded()); //Parse URL-encoded bodies

  app.use(cookieParser(process.env.COOKIE_SECRET! as string))

  //Add the client URL to the CORS policy
  const whitelist_env = process.env.WHITELISTED_DOMAINS! as string
  const whitelist = whitelist_env
    ? whitelist_env.split(",")
    : []

  const corsOptions: CorsOptions = {
    origin: whitelist,

    credentials: true,
  }

  app.use(cors(corsOptions))

  app.use(passport.initialize())

  app.get("/", (request, response) => {
    response.json({ info: "Node.js, Express, and Postgres API" });
  });
  app.listen(port, () => {
    console.log(`App running on port ${port}.`);
  });
  mountRoutes(app);
  app.use([
    handleError
  ]);
} catch (err) {
  console.error(err);
}

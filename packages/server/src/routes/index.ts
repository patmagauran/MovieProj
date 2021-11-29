import user from "./user";
import utility from "./utility";
import movies from "./movies";
const mountRoutes = (app: any) => {
  app.use("/users", user);
  app.use("/utility", utility);
  app.use("/movies", movies);
};

export default mountRoutes;

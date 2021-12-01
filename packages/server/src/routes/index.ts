import user from "./user";
import utility from "./utility";
import movies from "./movies";
import people from "./people";
const mountRoutes = (app: any) => {
  app.use("/users", user);
  app.use("/utility", utility);
  app.use("/movies", movies);
  app.use("/people", people);
};

export default mountRoutes;

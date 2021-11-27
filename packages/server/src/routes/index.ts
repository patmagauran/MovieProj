import user from "./user";
import utility from "./utility";
const mountRoutes = (app: any) => {
  app.use("/users", user);
  app.use("/utility", utility);
};

export default mountRoutes;

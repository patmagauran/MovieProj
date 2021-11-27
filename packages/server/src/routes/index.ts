import user from "./user";
const mountRoutes = (app: any) => {
  app.use("/users", user);
};

export default mountRoutes;

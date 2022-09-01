import taskRouter from "./task.router";
import { Router } from "express";
import userRouter from "./user.router";
import jwtMiddleware from "../middlewares/jwt.middleware";

const routes = Router();

routes.use("/tasks", jwtMiddleware, taskRouter);
routes.use("/users", userRouter);

export default routes;

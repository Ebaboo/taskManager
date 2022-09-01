import { Router } from "express";
import prisma from "../../prisma/prismaClient";
import userController from "../controllers/user.controller";

const userRouter = Router();

userRouter.post("/login", userController.login);
userRouter.post("/register", userController.register);

export default userRouter;

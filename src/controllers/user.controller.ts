import { NextFunction, Request, Response } from "express";
import { compare, hash } from "bcrypt";
import { z, ZodError } from "zod";
import prisma from "../../prisma/prismaClient";
import jwt from "jsonwebtoken";

interface RegisterResponse {
  email: string;
}

interface LoginResponse {
  email: string;
  name: string;
  token: string;
  id: string;
}

const registerPayloadSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(3, { message: "Password too short" }),
  name: z.string().min(2, { message: "Name is too short" }),
});

type RegisterPayload = z.infer<typeof registerPayloadSchema>;

const loginPayloadSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(3, { message: "Password too short" }),
});

type LoginRegisterPayload = z.infer<typeof loginPayloadSchema>;

const userController = {
  login: async (
    req: Request<unknown, LoginResponse, LoginRegisterPayload>,
    res: Response<LoginResponse | ZodError>,
    next: NextFunction
  ) => {
    try {
      const { email, password } = loginPayloadSchema.parse(req.body);
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      const token = jwt.sign({ uid: user?.id }, process.env.JWT_SECRET!, {
        expiresIn: "1d",
      });

      if (!user) {
        next(new Error("User not found"));
        return;
      }

      if (!(await compare(password, user.password))) {
        next(new Error("Invalid password"));
        return;
      }

      res
        .status(200)
        .send({ email: user.email, name: user.name, id: user.id, token });
    } catch (err) {
      next(err);
    }
  },
  register: async (
    req: Request<unknown, RegisterResponse, RegisterPayload>,
    res: Response<RegisterResponse | ZodError>,
    next: NextFunction
  ) => {
    try {
      const { email, password, name } = registerPayloadSchema.parse(req.body);
      const user = await prisma.user.create({
        data: {
          email,
          password: await hash(password, 10),
          name,
        },
      });

      res.status(200).send({ email: user.email });
    } catch (err) {
      next(err);
    }
  },
};

export default userController;

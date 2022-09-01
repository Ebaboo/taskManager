import cookieParser from "cookie-parser";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../prisma/prismaClient";

const jwtMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token: string = req.cookies.token;

  if (!token) {
    return res.status(401).send({
      error: {
        message: "No token provided",
      },
    });
  }

  jwt.verify(token, process.env.JWT_SECRET!, async (err, decoded) => {
    if (err) {
      return res.status(401).send({
        error: {
          message: "Unauthorized",
        },
      });
    }

    const userId = (decoded as { uid: string }).uid;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(401).send({
        error: {
          message: "Invalid token",
        },
      });
    }

    req.user = user;
    next();
  });
};

export default jwtMiddleware;

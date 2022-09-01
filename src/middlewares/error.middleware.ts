import { ZodError } from "zod";
import { NextFunction, Request, Response } from "express";

const errorMiddleware = async (
  error: Error | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ZodError) {
    const errorMessages = error.issues.map((err) => {
      return {
        field: err.path[0],
        message: err.message,
      };
    });
    return res.status(400).send(errorMessages);
  }

  return res.status(500).send({ message: error.message });
};

export default errorMiddleware;

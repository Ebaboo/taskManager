import { Prisma, Task } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import prisma from "../../prisma/prismaClient";
import { z } from "zod";
import { addHours, addMinutes, addSeconds } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";

const createTaskPayloadSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 chars long" }),
  shortDescription: z
    .string()
    .min(2, { message: "Short description must be at least 2 chars long" }),
  description: z
    .string()
    .min(2, { message: "Description must be at least 2 chars long" }),
  dueDate: z.preprocess((arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
  }, z.date()),
  duration: z
    .number()
    .positive({ message: "Duration value must be positive number" })
    .min(15, { message: "Duration must be at least 15 minutes" }),
  status: z.enum(["DONE", "CANCELED", "UPCOMING"]),
});

const updateTaskPayloadSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Title must be at least 2 chars long" })
    .optional(),
  shortDescription: z
    .string()
    .min(2, { message: "Short description must be at least 2 chars long" })
    .optional(),
  description: z
    .string()
    .min(2, { message: "Description must be at least 2 chars long" })
    .optional(),
  dueDate: z
    .preprocess((arg) => {
      if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date())
    .optional(),
  duration: z
    .number()
    .positive({ message: "Duration value must be positive number" })
    .min(15, { message: "Duration must be at least 15 minutes" })
    .optional(),
  status: z.enum(["DONE", "CANCELED", "UPCOMING"]).optional(),
});

type CreateTaskPayload = z.infer<typeof createTaskPayloadSchema>;
type UpdateTaskPayload = z.infer<typeof updateTaskPayloadSchema>;

const tasksController = {
  getTasks: async (req: Request, res: Response, next: NextFunction) => {
    const tasks = await prisma.task.findMany({
      where: {
        userId: req.user?.id,
      },
    });
    res.status(200).send({ tasks });
  },
  getTask: async (
    req: Request<any, UpdateTaskPayload>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const task = await prisma.task.findUnique({
        where: {
          id: req.params.id,
        },
      });

      if (!task) {
        next({ message: "Task not found" });
      }

      res.status(200).send({ task });
      return;
    } catch (err) {
      next(err);
    }
  },
  createTask: async (
    req: Request<unknown, CreateTaskPayload, Task>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        description,
        dueDate,
        duration,
        shortDescription,
        status,
        title,
      } = createTaskPayloadSchema.parse(req.body);

      const task = await prisma.task.create({
        data: {
          userId: req.user?.id!,
          description,
          dueDate,
          duration,
          shortDescription,
          status,
          title,
        },
      });

      res.status(201).send({ task });
      return;
    } catch (err) {
      next(err);
    }
  },

  updateTask: async (
    req: Request<any, UpdateTaskPayload>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        description,
        dueDate,
        duration,
        shortDescription,
        status,
        title,
      } = updateTaskPayloadSchema.parse(req.body);

      await prisma.user.update({
        where: {
          id: req.user?.id!,
        },
        data: {
          Tasks: {
            update: {
              where: {
                id: req.params.id,
              },
              data: {
                description,
                dueDate,
                duration,
                shortDescription,
                status,
                title,
              },
            },
          },
        },
      });

      const task = await prisma.task.findUnique({
        where: {
          id: req.params.id,
        },
      });

      res.status(201).send({ task });
      return;
    } catch (err) {
      next(err);
    }
  },
  deleteTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await prisma.task.findFirst({
        where: {
          id: req.params.id,
        },
      });

      if (!!task && task?.userId !== req.user?.id) {
        next({ message: "You cannot delete task, that made by other users" });
        return;
      }

      await prisma.task.delete({
        where: {
          id: task?.id || "",
        },
      });

      res.status(201).send({ message: "Task deleted" });
      return;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        next({ message: err?.meta?.cause });
        return;
      }
      next("Something went wrong");
    }
  },
  getAllTasksDates: async (req: Request, res: Response, next: NextFunction) => {
    const tasks = await prisma.task.findMany({
      where: {
        userId: req.user?.id,
      },
      select: {
        dueDate: true,
      },
    });
    res.status(200).send({
      dates: tasks.map((task) => task.dueDate),
    });
  },
  getTasksByDay: async (req: Request, res: Response, next: NextFunction) => {
    const { date, TZOffset } = req.query as Partial<{
      date: string;
      TZOffset: number;
    }>;

    if (!date || !TZOffset) {
      next({ message: "Date query param is required" });
      return;
    }

    if (!TZOffset) {
      next({ message: "TZOffset query param is required" });
      return;
    }

    const isNotIsoDate =
      !/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/.test(
        date.toString()
      );

    const convertedDate = new Date(date.toString());

    const isNotShortDate =
      !/\d{2}-\d{2}-\d{4}/.test(date.toString()) &&
      !/\d{2}\/\d{2}\/\d{4}/.test(date.toString());

    if ((isNotIsoDate && isNotShortDate) || typeof date !== "string") {
      next({ message: "Wrong format" });
      return;
    }

    let shortDateToDate = null;
    let notIsoDate = null;

    try {
      shortDateToDate = new Date(convertedDate);
      notIsoDate = new Date(shortDateToDate.valueOf() + TZOffset * 60 * 1000);
    } catch {
      next({ message: "Wrong format" });
      return;
    }

    const startDate = notIsoDate;

    const endDate = addSeconds(addMinutes(addHours(startDate, 23), 59), 59);

    console.log(startDate, endDate);

    try {
      const tasks = await prisma.task.findMany({
        where: {
          userId: req.user?.id,
          dueDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          dueDate: "asc",
        },
      });

      res.status(200).send({
        tasks,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default tasksController;

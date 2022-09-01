"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = __importDefault(require("../../prisma/prismaClient"));
const zod_1 = require("zod");
const createTaskPayloadSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, { message: "Title must be at least 2 chars long" }),
    shortDescription: zod_1.z
        .string()
        .min(2, { message: "Short description must be at least 2 chars long" }),
    description: zod_1.z
        .string()
        .min(2, { message: "Description must be at least 2 chars long" }),
    dueDate: zod_1.z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date)
            return new Date(arg);
    }, zod_1.z.date()),
    duration: zod_1.z
        .number()
        .positive({ message: "Duration value must be positive number" })
        .min(15, { message: "Duration must be at least 15 minutes" }),
    status: zod_1.z.enum(["DONE", "CANCELED", "UPCOMING"]),
});
const updateTaskPayloadSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(2, { message: "Title must be at least 2 chars long" })
        .optional(),
    shortDescription: zod_1.z
        .string()
        .min(2, { message: "Short description must be at least 2 chars long" })
        .optional(),
    description: zod_1.z
        .string()
        .min(2, { message: "Description must be at least 2 chars long" })
        .optional(),
    dueDate: zod_1.z
        .preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date)
            return new Date(arg);
    }, zod_1.z.date())
        .optional(),
    duration: zod_1.z
        .number()
        .positive({ message: "Duration value must be positive number" })
        .min(15, { message: "Duration must be at least 15 minutes" })
        .optional(),
    status: zod_1.z.enum(["DONE", "CANCELED", "UPCOMING"]).optional(),
});
const tasksController = {
    getTasks: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const tasks = yield prismaClient_1.default.task.findMany({
            where: {
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            },
        });
        res.status(200).send(tasks);
    }),
    createTask: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        try {
            const { description, dueDate, duration, shortDescription, status, title, } = createTaskPayloadSchema.parse(req.body);
            const task = yield prismaClient_1.default.task.create({
                data: {
                    userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
                    description,
                    dueDate,
                    duration,
                    shortDescription,
                    status,
                    title,
                },
            });
            res.status(201).send(task);
            return;
        }
        catch (err) {
            next(err);
        }
    }),
    updateTask: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        try {
            const { description, dueDate, duration, shortDescription, status, title, } = updateTaskPayloadSchema.parse(req.body);
            yield prismaClient_1.default.user.update({
                where: {
                    id: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id,
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
            const task = yield prismaClient_1.default.task.findUnique({
                where: {
                    id: req.params.id,
                },
            });
            res.status(201).send(task);
            return;
        }
        catch (err) {
            next(err);
        }
    }),
    deleteTask: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _d;
        try {
            yield prismaClient_1.default.user.update({
                where: {
                    id: (_d = req.user) === null || _d === void 0 ? void 0 : _d.id,
                },
                data: {
                    Tasks: {
                        delete: {
                            id: req.params.id,
                        },
                    },
                },
            });
            res.status(201).send({ message: "Task deleted" });
            return;
        }
        catch (err) {
            next(err);
        }
    }),
};
exports.default = tasksController;

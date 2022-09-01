"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tasks_controller_1 = __importDefault(require("../controllers/tasks.controller"));
const taskRouter = (0, express_1.Router)();
taskRouter.get("/", tasks_controller_1.default.getTasks);
taskRouter.post("/", tasks_controller_1.default.createTask);
taskRouter.put("/:id", tasks_controller_1.default.updateTask);
taskRouter.delete("/:id", tasks_controller_1.default.deleteTask);
exports.default = taskRouter;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const task_router_1 = __importDefault(require("./task.router"));
const express_1 = require("express");
const user_router_1 = __importDefault(require("./user.router"));
const jwt_middleware_1 = __importDefault(require("../middlewares/jwt.middleware"));
const routes = (0, express_1.Router)();
routes.use("/tasks", jwt_middleware_1.default, task_router_1.default);
routes.use("/users", user_router_1.default);
exports.default = routes;

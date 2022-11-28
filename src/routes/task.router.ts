import { Router } from "express";
import tasksController from "../controllers/tasks.controller";

const taskRouter = Router();

taskRouter.get("/", tasksController.getTasks);
taskRouter.get("/dates", tasksController.getAllTasksDates);
taskRouter.get("/:id", tasksController.getTask);
taskRouter.post("/", tasksController.createTask);
taskRouter.put("/:id", tasksController.updateTask);
taskRouter.delete("/:id", tasksController.deleteTask);

export default taskRouter;

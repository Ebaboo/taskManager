import { Router } from "express";
import tasksController from "../controllers/tasks.controller";

const taskRouter = Router();

taskRouter.get("/", tasksController.getTasks);
taskRouter.get("/:id", tasksController.getTask);
taskRouter.post("/", tasksController.createTask);
taskRouter.put("/:id", tasksController.updateTask);
taskRouter.delete("/:id", tasksController.deleteTask);
taskRouter.get("/dates", tasksController.getAllTasksDates);

export default taskRouter;

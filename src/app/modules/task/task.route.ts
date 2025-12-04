import { Router } from "express";
import authGuard from "../../middlewares/authGuard";
import { UserRole } from "../../interfaces/userRole";

import { taskController } from "./task.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createTaskZodSchema, updateTaskStatusZodSchema } from "./task.validation";



const router = Router();
router.get("/", authGuard(UserRole.ADMIN), taskController.getAllTask);

router.post(
  "/",
  authGuard(UserRole.ADMIN,UserRole.MANAGER),
  validateRequest(createTaskZodSchema),
  taskController.createTask
);
router.get(
  "/my-assigned-tasks",
  authGuard(UserRole.ADMIN, UserRole.MANAGER,UserRole.EMPLOYEE),
  taskController.getMyAssignedTasks
);
router.get(
  "/:id",
  authGuard(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  taskController.getTaskById
);
router.delete(
  "/soft-delete/:id",
  authGuard(UserRole.ADMIN,UserRole.MANAGER),
  taskController.softDeleteTask
);
router.patch(
  "/status/:id",
  authGuard(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(updateTaskStatusZodSchema),
  taskController.updateTaskStatus
);

export const taskRoutes = router;

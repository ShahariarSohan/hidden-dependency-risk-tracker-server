import { Router } from "express";
import authGuard from "../../middlewares/authGuard";
import { UserRole } from "../../interfaces/userRole";

import { taskController } from "./task.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createTaskZodSchema } from "./task.validation";


const router = Router();

router.post(
  "/",
  authGuard(UserRole.ADMIN,UserRole.MANAGER),
  validateRequest(createTaskZodSchema),
  taskController.createTask
);
router.get("/", authGuard(UserRole.ADMIN), taskController.getAllTask);
export const taskRoutes = router;

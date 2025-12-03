import { Router } from "express";
import authGuard from "../../middlewares/authGuard";
import { UserRole } from "../../interfaces/userRole";
import { validateRequest } from "../../middlewares/validateRequest";
import { createTaskZodSchema } from "./task.validation";
import { taskController } from "./task.controller";


const router = Router();

router.post(
  "/",
  authGuard(UserRole.ADMIN,UserRole.MANAGER),
  validateRequest(createTaskZodSchema),
  taskController.createTask
);
export const taskRoutes = router;

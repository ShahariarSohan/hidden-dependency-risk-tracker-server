import { Router } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createEmployeeZodSchema,
  createManagerZodSchema,
} from "./user.validation";
import { UserRole } from "../../interfaces/userRole";
import authGuard from "../../middlewares/authGuard";

const router = Router();

router.post(
  "/employee",
  authGuard(UserRole.ADMIN),
  validateRequest(createEmployeeZodSchema),
  userController.createEmployee
);
router.post(
  "/manager",
  authGuard(UserRole.ADMIN),
  validateRequest(createManagerZodSchema),
  userController.createManager
);

export const userRoutes = router;

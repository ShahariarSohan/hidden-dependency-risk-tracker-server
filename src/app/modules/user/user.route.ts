import { Router } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createEmployeeZodSchema,
  createManagerZodSchema,
  updateMyProfileZodSchema,
  
} from "./user.validation";
import { UserRole } from "../../interfaces/userRole";
import authGuard from "../../middlewares/authGuard";
import { updateStatusZodSchema } from "../../zod/status.schema";

const router = Router();
router.get(
  "/",
  authGuard( UserRole.ADMIN),
  userController.getAllUser
);
router.get("/:id", authGuard(UserRole.ADMIN), userController.getUserById);

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
router.get(
  "/me",
  authGuard(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  userController.getMyProfile
);
router.patch(
  "/status/:id",
  authGuard(UserRole.ADMIN),
  validateRequest(updateStatusZodSchema),
  userController.updateUserStatus
);

router.patch(
  "/update-my-profile",
  authGuard( UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  validateRequest(updateMyProfileZodSchema),
  userController.updateMyProfile

);
export const userRoutes = router;

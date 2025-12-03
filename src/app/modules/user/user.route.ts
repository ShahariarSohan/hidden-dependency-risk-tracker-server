import { Router } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createEmployeeZodSchema,
  createManagerZodSchema,
  updateMyProfileZodSchema,
  updateUserStatusZodSchema,
} from "./user.validation";
import { UserRole } from "../../interfaces/userRole";
import authGuard from "../../middlewares/authGuard";

const router = Router();
router.get(
  "/",
  authGuard( UserRole.ADMIN),
  userController.getAllUser
);
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
  "/:id/status",
  authGuard( UserRole.ADMIN),
  validateRequest(updateUserStatusZodSchema),
  userController.changeProfileStatus
);

router.patch(
  "/update-my-profile",
  authGuard( UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  validateRequest(updateMyProfileZodSchema),
  userController.updateMyProfile

);
export const userRoutes = router;

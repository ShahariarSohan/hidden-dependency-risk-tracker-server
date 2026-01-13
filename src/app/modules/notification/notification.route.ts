import { Router } from "express";
import { notificationController } from "./notification.controller";
import authGuard from "../../middlewares/authGuard";
import { UserRole } from "../../interfaces/userRole";

const router = Router();

router.get(
  "/my-notifications",
  authGuard(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  notificationController.getMyNotifications
);

export const notificationRoutes = router;

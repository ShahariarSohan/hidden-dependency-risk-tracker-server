import { Router } from "express";
import authGuard from "../../middlewares/authGuard";
import { UserRole } from "../../interfaces/userRole";
import { validateRequest } from "../../middlewares/validateRequest";
import { createSystemZodSchema } from "./system.validation";
import { systemController } from "./system.controller";
import { updateStatusZodSchema } from "../../zod/status.schema";

const router = Router();

router.post(
  "/",
  authGuard(UserRole.ADMIN),
  validateRequest(createSystemZodSchema),
  systemController.createSystem
);

router.get("/", authGuard(UserRole.ADMIN), systemController.getAllSystem);
router.get(
  "/:id",
  authGuard(UserRole.ADMIN, UserRole.MANAGER),
  systemController.getSystemById
);

router.delete(
  "/soft-delete/:id",
  authGuard(UserRole.ADMIN),
  systemController.softDeleteSystem
);
router.patch(
  "/status/:id",
  authGuard(UserRole.ADMIN),
  validateRequest(updateStatusZodSchema),
  systemController.updateSystemStatus
);

export const systemRoutes = router;

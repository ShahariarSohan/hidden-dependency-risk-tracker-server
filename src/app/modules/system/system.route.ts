import { Router } from "express";
import authGuard from "../../middlewares/authGuard";
import { UserRole } from "../../interfaces/userRole";
import { validateRequest } from "../../middlewares/validateRequest";
import { createSystemZodSchema } from "./system.validation";
import { systemController } from "./system.controller";


const router = Router();

router.post(
  "/",
  authGuard(UserRole.ADMIN),
  validateRequest(createSystemZodSchema),
  systemController.createSystem
);

router.get("/", authGuard(UserRole.ADMIN), systemController.getAllSystem);
export const systemRoutes = router;

import { Router } from "express";
import authGuard from "../../middlewares/authGuard";
import { UserRole } from "../../interfaces/userRole";
import { managerController } from "./manager.controller";
import { updateStatusZodSchema } from "../../zod/status.schema";
import { validateRequest } from "../../middlewares/validateRequest";


const router = Router();
router.get("/", authGuard(UserRole.ADMIN), managerController.getAllManager);
router.delete(
  "/soft-delete/:id",
  authGuard(UserRole.ADMIN),
  managerController.softDeleteManager
);
router.patch(
  "/status/:managerId",
  authGuard(UserRole.ADMIN),
  validateRequest(updateStatusZodSchema),
  managerController.updateManagerStatus
);
export const managerRoutes = router;

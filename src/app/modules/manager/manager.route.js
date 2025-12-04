import { Router } from "express";
import authGuard from "../../middlewares/authGuard";
import { UserRole } from "../../interfaces/userRole";
import { managerController } from "./manager.controller";
const router = Router();
router.get("/", authGuard(UserRole.ADMIN), managerController.getAllManager);
router.delete("/soft-delete/:id", authGuard(UserRole.ADMIN), managerController.softDeleteManager);
export const managerRoutes = router;

import { Router } from "express";
import authGuard from "../../middlewares/authGuard";
import { UserRole } from "../../interfaces/userRole";
import { managerController } from "./manager.controller";


const router = Router();
router.get("/", authGuard(UserRole.ADMIN), managerController.getAllManager);
export const managerRoutes = router;

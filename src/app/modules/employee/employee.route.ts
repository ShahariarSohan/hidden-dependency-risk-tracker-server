import { Router } from "express";
import authGuard from "../../middlewares/authGuard";
import { UserRole } from "../../interfaces/userRole";
import { employeeController } from "./employee.controller";

const router = Router();
router.get("/", authGuard(UserRole.ADMIN), employeeController.getAllEmployee);
export const employeeRoutes = router;
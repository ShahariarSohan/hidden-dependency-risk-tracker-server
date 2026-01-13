import { Router } from "express";
import { auditController } from "./audit.controller";
import authGuard from "../../middlewares/authGuard";
import { UserRole } from "../../interfaces/userRole";

const router = Router();

router.get("/", authGuard(UserRole.ADMIN), auditController.getAuditLogs);

export const auditRoutes = router;

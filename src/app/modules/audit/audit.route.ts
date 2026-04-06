import { Router } from "express";
import authGuard from "../../middlewares/authGuard";
import { UserRole } from "../../interfaces/userRole";
import { auditController } from "./audit.controller";

const router = Router();

// Only Admin can fetch global audit logs
router.get("/", authGuard(UserRole.ADMIN), auditController.getAllAuditLogs);

export const auditRoutes = router;

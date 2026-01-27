import { Router } from "express";



const router = Router();

// router.get("/", authGuard(UserRole.ADMIN), auditController.getAuditLogs);

export const auditRoutes = router;

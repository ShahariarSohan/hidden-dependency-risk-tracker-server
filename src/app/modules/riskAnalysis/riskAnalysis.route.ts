import { Router } from "express";
import { riskAnalysisController } from "./riskAnalysis.controller";

import { UserRole } from "../../interfaces/userRole";
import authGuard from "../../middlewares/authGuard";

const router = Router();

router.get(
  "/",
  authGuard(UserRole.ADMIN, UserRole.MANAGER),
  riskAnalysisController.getRiskDashboard
);
router.get(
  "/employee",
  authGuard(UserRole.ADMIN),
  riskAnalysisController.getAllEmployeeRisk
);
router.get(
  "/employee-risk",
  authGuard(UserRole.EMPLOYEE),
  riskAnalysisController.getEmployeeOwnRisk
);

router.get(
  "/system",
  authGuard(UserRole.ADMIN),
  riskAnalysisController.getAllSystemRisk
);
router.get(
  "/system/:systemId",
  authGuard(UserRole.ADMIN, UserRole.MANAGER),
  riskAnalysisController.getSystemRisk
);

router.get(
  "/team",
  authGuard(UserRole.ADMIN),
  riskAnalysisController.getAllTeamRisk
);
router.get(
  "/my-team-risk",
  authGuard(UserRole.MANAGER),
  riskAnalysisController.getManagerTeamRisk
);


export const riskAnalysisRoutes=router;

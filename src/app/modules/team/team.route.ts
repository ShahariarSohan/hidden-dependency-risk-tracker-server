import { Router } from "express";
import authGuard from "../../middlewares/authGuard";
import { UserRole } from "../../interfaces/userRole";
import { validateRequest } from "../../middlewares/validateRequest";

import { teamController } from "./team.controller";
import { updateStatusZodSchema } from "../../zod/status.schema";
import { teamZodSchema } from "./team.validation";

const router = Router();

router.post(
  "/",
  authGuard(UserRole.ADMIN,UserRole.MANAGER),
  validateRequest(teamZodSchema),
  teamController.createTeam
);
router.get("/", authGuard(UserRole.ADMIN), teamController.getAllTeam);
router.get(
  "/my-teams",
  authGuard(UserRole.EMPLOYEE),
  teamController.getMyTeams
);
router.get(
  "/:id",
  authGuard(UserRole.ADMIN, UserRole.MANAGER),
  teamController.getTeamById
);


router.delete(
  "/soft-delete/:id",
  authGuard(UserRole.ADMIN, UserRole.MANAGER),
  teamController.softDeleteTeam
);
router.patch(
  "/status/:id",
  authGuard(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(updateStatusZodSchema),
  teamController.updateTeamStatus
);
router.patch(
  "/name/:id",
  authGuard(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(teamZodSchema),
  teamController.updateTeamName
);

export const teamRoutes = router;

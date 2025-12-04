import { Router } from "express";
import authGuard from "../../middlewares/authGuard";
import { UserRole } from "../../interfaces/userRole";
import { validateRequest } from "../../middlewares/validateRequest";
import { createTeamZodSchema } from "./team.validation";
import { teamController } from "./team.controller";
import { updateStatusZodSchema } from "../../zod/status.schema";

const router = Router();

router.post(
  "/",
  authGuard(UserRole.ADMIN,UserRole.MANAGER),
  validateRequest(createTeamZodSchema),
  teamController.createTeam
);
router.get(
  "/:id",
  authGuard(UserRole.ADMIN, UserRole.MANAGER),
  teamController.getTeamById
);

router.get("/", authGuard(UserRole.ADMIN), teamController.getAllTeam);
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

export const teamRoutes = router;

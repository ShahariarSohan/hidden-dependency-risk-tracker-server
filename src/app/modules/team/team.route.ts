import { Router } from "express";
import authGuard from "../../middlewares/authGuard";
import { UserRole } from "../../interfaces/userRole";
import { validateRequest } from "../../middlewares/validateRequest";
import { createTeamZodSchema } from "./team.validation";
import { teamController } from "./team.controller";

const router = Router();

router.post(
  "/",
  authGuard(UserRole.ADMIN),
  validateRequest(createTeamZodSchema),
  teamController.createTeam
);
router.get("/", authGuard(UserRole.ADMIN),teamController.getAllTeam);
export const teamRoutes = router;
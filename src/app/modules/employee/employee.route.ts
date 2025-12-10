import { Router } from "express";
import authGuard from "../../middlewares/authGuard";
import { UserRole } from "../../interfaces/userRole";
import { employeeController } from "./employee.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { addEmployeeToTeamZodSchema } from "./employee.validation";
import { updateStatusZodSchema } from "../../zod/status.schema";

const router = Router();
router.get("/", authGuard(UserRole.ADMIN,UserRole.MANAGER), employeeController.getAllEmployee);
router.get(
  "/:id",
  authGuard(UserRole.ADMIN),
  employeeController.getEmployeeById
);
router.patch(
  "/add-to-team/:employeeId",
  authGuard(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(addEmployeeToTeamZodSchema),
  employeeController.addEmployeeToTeam
);

router.delete(
  "/soft-delete/:id",
  authGuard( UserRole.ADMIN),
  employeeController.softDeleteEmployee
);
router.patch(
  "/status/:employeeId",
  authGuard(UserRole.ADMIN),
  validateRequest(updateStatusZodSchema),
  employeeController.updateEmployeeStatus
);
export const employeeRoutes = router;
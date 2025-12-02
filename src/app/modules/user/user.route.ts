import { Router } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createEmployeeZodSchema, createManagerZodSchema } from "./user.validation";

const router = Router();

router.post("/employee",validateRequest(createEmployeeZodSchema), userController.createEmployee);
router.post("/manager",validateRequest(createManagerZodSchema), userController.createManager);


export const userRoutes = router;
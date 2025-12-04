import { Router } from "express";
import { authController } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { loginZodSchema } from "./auth.validation";
const router = Router();
router.post("/login", validateRequest(loginZodSchema), authController.loginUser);
router.get("/me", authController.getMe);
export const authRoutes = router;

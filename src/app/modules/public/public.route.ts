import express from "express";
import { publicController } from "./public.controller";

const router = express.Router();

router.get("/landing-stats", publicController.getLandingStats);

export const publicRoutes = router;

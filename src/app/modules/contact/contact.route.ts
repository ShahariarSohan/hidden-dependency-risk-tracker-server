import { Router } from "express";
import { contactController } from "./contact.controlller";


const router = Router();

/**
 * POST /contact/send
 * Endpoint for sending contact form messages
 */
router.post("/send", contactController.sendContactEmail);

export const contactRoutes = router;

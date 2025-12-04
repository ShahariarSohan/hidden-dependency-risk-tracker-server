import z from "zod";
import { ActiveStatus } from "../interfaces/userRole";
export const updateStatusZodSchema = z.object({
    status: z.enum([ActiveStatus.ACTIVE, ActiveStatus.INACTIVE]),
});

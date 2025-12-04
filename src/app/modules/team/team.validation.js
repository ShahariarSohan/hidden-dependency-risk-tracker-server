import { z } from "zod";
export const createTeamZodSchema = z.object({
    name: z.string().min(3, "Name must be minimum 3 characters"),
});

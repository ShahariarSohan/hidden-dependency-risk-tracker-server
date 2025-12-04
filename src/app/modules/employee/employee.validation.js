import { z } from "zod";
export const addEmployeeToTeamZodSchema = z.object({
    teamId: z.string(),
});

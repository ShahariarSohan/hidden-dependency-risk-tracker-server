import { z } from "zod";

export const addManagerToTeamZodSchema = z.object({
  teamId: z.string().nonempty("teamId is required"),
});
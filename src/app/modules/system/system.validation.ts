import { z } from "zod";

export const createSystemZodSchema = z.object({
    name: z
      .string()
      .min(5, "System name must be at least 5 characters")
      .max(100, "System name cannot exceed 100 characters"),
    description: z
      .string()
      .min(10, "Description cannot be less than 10 characters")
      .optional(),
    criticality: z
      .number()
      .int("Criticality must be an integer")
      .min(1, "Criticality must be between 1 and 5")
      .max(5, "Criticality must be between 1 and 5")
    .optional(),
    teamId: z.string(),
});
export const updateSystemSchema = z.object({
  name: z.string().min(5, "System name must be at least 5 characters").optional(),
  description: z
    .string()
    .min(10, "Description cannot be less than 10 characters")
    .optional(),
  teamId: z.string().optional(),
});
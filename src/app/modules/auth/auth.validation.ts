import { z } from "zod";

export const loginZodSchema = z.object({
  email: z.email("Invalid email format"),

  password: z
    .string({
      error: "Password is required",
    })
    .min(6, "Password must be at least 6 characters"),
});

import { z } from "zod";

export const createManagerSchema = z.object({
  password: z
    .string({
      error: "Password is required",
    })
    .min(6, "Password must be at least 6 characters long")
    .regex(/\d/, "Password must contain at least one number"),

  name: z.string({
    error: "Name is required!",
  }),

  email: z.email({
    error: "Email is required!",
  }),
});

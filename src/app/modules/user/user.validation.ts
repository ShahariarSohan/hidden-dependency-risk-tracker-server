import { z } from "zod";

export const createManagerZodSchema = z.object({
  name: z.string({
    error: "Name is required!",
  }),

  email: z.email("Invalid email format"),
  password: z
    .string({
      error: "Password is required",
    })
    .min(6, "Password must be at least 6 characters")
    .regex(/\d/, "Password must contain at least one number"),
  contactNumber: z
    .string({
      error: "Contact number is required!",
    })
    .regex(/^\d{11}$/, "Contact number must be exactly 11 digits"),
});


export const createEmployeeZodSchema = z.object({
  name: z.string({
    error: "Name is required!",
  }),

  email: z.email("Invalid email format"),

  contactNumber: z
    .string({
      error: "Contact number is required!",
    })
    .regex(/^\d{11}$/, "Contact number must be exactly 11 digits"),
  password: z
    .string({
      error: "Password is required",
    })
    .min(6, "Password must be at least 6 characters")
    .regex(/\d/, "Password must contain at least one number"),
  teamId: z.string().optional(), // matches your Prisma model
});

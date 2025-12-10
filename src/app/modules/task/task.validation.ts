import { z } from "zod";
import { TaskStatus } from "../../interfaces/taskStatus";

export const createTaskZodSchema = z
  .object({
    title: z
      .string()
      .min(5, "Title must be at least 5 characters")
      .max(200, "Title cannot exceed 200 characters"),

    description: z
      .string()
      .max(2000, "Description cannot exceed 2000 characters")
      .optional(),
    priority: z
      .number()
      .int("Priority must be an integer")
      .min(1, "Priority must be between 1 and 5")
      .max(5, "Priority must be between 1 and 5")
      .optional(),

    // Assigned to Employee
    employeeId: z
      .string(),

    // Assigned by Manager (optional)
    assignedByManagerId: z
      .string()
      .optional(),

    // Assigned by Admin (optional)
    assignedByAdminId: z
      .string()
      .optional(),

    // Related system
    systemId: z
      .string()
  })
  
export const updateTaskStatusZodSchema = z.object({
  status: z.enum([TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED]),
});

export const updateTaskZodSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date",
    }),
});
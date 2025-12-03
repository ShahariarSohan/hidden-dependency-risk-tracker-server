import z from "zod";
import { ActiveStatus } from "../interfaces/userRole";
import { TaskStatus } from "../interfaces/taskStatus";

export const updateStatusZodSchema = z.object({
  
    status: z.enum([ActiveStatus.ACTIVE, ActiveStatus.INACTIVE,ActiveStatus.DELETED]),
 
});
export const updateTaskStatusZodSchema = z.object({
  
    status: z.enum([TaskStatus.PENDING,TaskStatus.IN_PROGRESS,TaskStatus.CANCELLED,TaskStatus.CANCELLED]),
 
});
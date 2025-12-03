import httpStatus from "http-status";
import { Request } from "express";
import { prisma } from "../../config/prisma";
import AppError from "../../errorHelpers/AppError";

const createTask = async (req: Request) => {
  const isEmployeeExist = await prisma.employee.findFirst({
    where: {
      id:req.body.employeeId
    },
  });
  if (!isEmployeeExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "Employee does't exist");
  }
  const isSystemExist = await prisma.system.findFirst({
    where: {
      id:req.body.systemId
    },
  });
  if (!isSystemExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "System does't exist");
  }
  
    const assignedById = req.body.assignedByAdminId || req.body.assignedByManagerId
     const isUserExist = await prisma.user.findFirst({
       where: {
         id: assignedById,
       },
     });
     if (!isUserExist) {
       throw new AppError(httpStatus.BAD_REQUEST, "User does't exist");
     }
   const result = await prisma.task.create({
     data: req.body,
   });

  return result;
};

export const taskService = {
  createTask,
};

import httpStatus from "http-status";
import { Request } from "express";
import { prisma } from "../../config/prisma";
import AppError from "../../errorHelpers/AppError";
import { UserRole } from "../../interfaces/userRole";
import { IAuthUser } from "../../interfaces/user.interface";


const createTask = async (req: Request  & { user?: IAuthUser }) => {
  const {email,role} = req.user as IAuthUser
  
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
  
    
    let assignedByAdminId: string | null = null;
    let assignedByManagerId: string | null = null;

    if (role === UserRole.ADMIN) {
      const admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin) {
        throw new AppError(httpStatus.FORBIDDEN, "Admin not found");
      }
      assignedByAdminId = admin.id;
    }

    if (role === UserRole.MANAGER) {
      const manager = await prisma.manager.findUnique({
        where: { email},
      });
      if (!manager) {
        throw new AppError(httpStatus.FORBIDDEN, "Manager not found");
      }
      assignedByManagerId = manager.id;
    }


   const result = await prisma.task.create({
     data: {...req.body,assignedByAdminId,assignedByManagerId},
   });

  return result;
};

export const taskService = {
  createTask,
};

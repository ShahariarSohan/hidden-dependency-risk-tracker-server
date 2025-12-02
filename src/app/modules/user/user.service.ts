import  httpStatus  from 'http-status-codes';
import bcrypt from "bcrypt";
import { Employee, Manager } from "../../../../prisma/generated/client";
import { prisma } from "../../config/prisma";
import { envVariables } from "../../config/env";
import { IEmployee, IManager } from "../../interfaces/user.interface";
import { UserRole } from "../../interfaces/userRole";
import AppError from "../../errorHelpers/AppError";

const createEmployee = async (employeeData: IEmployee): Promise<Employee> => {
    const existingUser = await prisma.user.findUnique({
      where: { email: employeeData.email },
    });
    if (existingUser) {
      throw new AppError(httpStatus.BAD_REQUEST, "Email already exists");
    }
  const hashedPassword: string = await bcrypt.hash(
    employeeData.password,
    Number(envVariables.BCRYPT_SALT_ROUND)
  );

  const userData = {
    email: employeeData.email,
    password: hashedPassword,
    role: UserRole.EMPLOYEE,
  };

  const result = await prisma.$transaction(async (tx) => {
    const createdUser=await tx.user.create({
      data: userData,
    });

    const createdEmployeeData = await tx.employee.create({
      data: {
        name: employeeData.name,
        email: createdUser.email,
        contactNumber: employeeData.contactNumber,
      },
    });

    return createdEmployeeData;
  });

  return result;
};
const createManager = async (managerData: IManager): Promise<Manager> => {
    const existingUser = await prisma.user.findUnique({
      where: { email: managerData.email },
    });
    if (existingUser) {
      throw new AppError(httpStatus.BAD_REQUEST,"Email already exists");
    }
  const hashedPassword: string = await bcrypt.hash(
    managerData.password,
    Number(envVariables.BCRYPT_SALT_ROUND)
  );

  const userData = {
    email: managerData.email,
    password: hashedPassword,
    role: UserRole.MANAGER,
  };

  const result = await prisma.$transaction(async (tx) => {
   const createdUser= await tx.user.create({
      data: userData,
    });

    const createdManagerData = await tx.manager.create({
      data: {
        name: managerData.name,
        email: createdUser.email,
        contactNumber: managerData.contactNumber,
      },
    });

    return createdManagerData;
  });
    return result;
 
};

export const userService = {
    createEmployee,
    createManager
};

import  httpStatus  from 'http-status-codes';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Employee, Prisma } from "../../../../prisma/generated/client";
import { prisma } from "../../config/prisma";
import { IPaginationOptions } from "../../interfaces/pagination";
import { ActiveStatus } from "../../interfaces/userRole";
import { paginationHelper } from "../../shared/paginationHelper";
import { employeeSearchAbleFields } from "./employee.constant";
import AppError from '../../errorHelpers/AppError';
import { TaskStatus } from '../../interfaces/taskStatus';


const getAllEmployee = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.EmployeeWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: employeeSearchAbleFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.EmployeeWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.employee.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
  });

  const total = await prisma.employee.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};
const softDeleteEmployee = async (id: string): Promise<Employee> => {
   const employee = await prisma.employee.findUnique({ where: { id } });
   if (!employee) {
     throw new AppError(httpStatus.NOT_FOUND, "Employee not found");
   }
  const hasActiveTasks = await prisma.task.findFirst({
    where: {
      employeeId: id,
      status: {
        in: [TaskStatus.IN_PROGRESS,TaskStatus.PENDING],
      },
    },
  });
  if (hasActiveTasks) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Employee has unfinished tasks. Reassign or complete them first."
    );
  }
  return prisma.$transaction(async (tx) => {
    const employee = await tx.employee.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    await tx.user.update({
      where: {
        email: employee.email,
      },
      data: {
        status: ActiveStatus.INACTIVE,
      },
    });

    return employee;
  });
};
const getEmployeeById = async (id: string) => {
  return prisma.employee.findFirstOrThrow({
    where: {
      id,
      isDeleted: false,
      user: {
        status: ActiveStatus.ACTIVE,
      },
    },
    include: {
      team: true,
      tasks: true,
    },
  });
};
const addEmployeeToTeam = async (employeeId: string, teamId: string) => {
  // Check if employee exists and not deleted
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, isDeleted: false },
  });
  if (!employee) {
    throw new AppError(httpStatus.NOT_FOUND, "Employee not found or inactive");
  }

  // Check if team exists and is active
  const team = await prisma.team.findFirst({
    where: { id: teamId, status: ActiveStatus.ACTIVE },
  });
  if (!team) {
    throw new AppError(httpStatus.NOT_FOUND, "Team not found or inactive");
  }

  // Assign employee to team
  const updatedEmployee = await prisma.employee.update({
    where: { id: employeeId },
    data: { teamId },
  });

  return updatedEmployee;
};

export const employeeService = {
  getAllEmployee,
  softDeleteEmployee,
  getEmployeeById,
  addEmployeeToTeam,
};
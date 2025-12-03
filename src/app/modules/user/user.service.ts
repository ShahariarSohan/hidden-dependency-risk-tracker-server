/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import bcrypt from "bcrypt";
import {
  Employee,
  Manager,
  Prisma,
  User,
} from "../../../../prisma/generated/client";
import { prisma } from "../../config/prisma";
import { envVariables } from "../../config/env";
import {
  IAuthUser,
  IEmployee,
  IManager,
} from "../../interfaces/user.interface";
import { ActiveStatus, UserRole } from "../../interfaces/userRole";
import AppError from "../../errorHelpers/AppError";
import { userSearchAbleFields } from "./user.constant";
import { paginationHelper } from "../../shared/paginationHelper";
import { IPaginationOptions } from "../../interfaces/pagination";

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
    const createdUser = await tx.user.create({
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
    throw new AppError(httpStatus.BAD_REQUEST, "Email already exists");
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
    const createdUser = await tx.user.create({
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
const getMyProfile = async (user: IAuthUser) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: ActiveStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
    },
  });

  let profileInfo;

  if (userInfo.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        contactNumber: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
        assignedTasks: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            employeeId: true,
            systemId: true,
            completedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  } else if (userInfo.role === UserRole.MANAGER) {
    profileInfo = await prisma.manager.findUnique({
      where: {
        email: userInfo.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        contactNumber: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
        assignedTasks: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            employeeId: true,
            systemId: true,
            completedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  } else if (userInfo.role === UserRole.EMPLOYEE) {
    profileInfo = await prisma.employee.findUnique({
      where: {
        email: userInfo.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        contactNumber: true,
        isDeleted: true,
        tasks: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            employeeId: true,
            assignedByAdmin: {
              select: {
                email: true,
                name: true,
                contactNumber: true,
              },
            },
            assignedByManager: {
              select: {
                email: true,
                name: true,
                contactNumber: true,
              },
            },
            systemId: true,
            completedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  return { userInfo, profileInfo };
};

const updateMyProfile = async (user: IAuthUser, updateData: Partial<User>) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: ActiveStatus.ACTIVE,
    },
  });

  let profileInfo;

  if (userInfo.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: userInfo.email,
      },
      data: updateData,
    });
  } else if (userInfo.role === UserRole.MANAGER) {
    profileInfo = await prisma.manager.update({
      where: {
        email: userInfo.email,
      },
      data: updateData,
    });
  } else if (userInfo.role === UserRole.EMPLOYEE) {
    profileInfo = await prisma.employee.update({
      where: {
        email: userInfo.email,
      },
      data: updateData,
    });
  }

  return { ...profileInfo };
};
const updateUserStatus = async (id: string, status: ActiveStatus) => {
  return prisma.user.update({
    where: { id },
    data: { status },
  });
};

const getAllUser = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: userSearchAbleFields.map((field) => ({
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

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
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
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      admin: true,
      manager: true,
      employee: true,
    },
  });

  const total = await prisma.user.count({
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
const getUserById = async (id: string) => {
  return prisma.user.findFirstOrThrow({
    where: {
      id,
      status: ActiveStatus.ACTIVE,
    },
  });
};

export const userService = {
  createEmployee,
  createManager,
  getMyProfile,
  updateMyProfile,
  updateUserStatus,
  getAllUser,
  getUserById
};

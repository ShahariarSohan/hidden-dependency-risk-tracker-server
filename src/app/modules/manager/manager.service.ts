import  httpStatus  from 'http-status-codes';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Manager, Prisma } from "../../../../prisma/generated/client";
import { prisma } from "../../config/prisma";
import AppError from "../../errorHelpers/AppError";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../shared/paginationHelper";
import { managerSearchAbleFields } from "./manager.constant";
import { TaskStatus } from '../../interfaces/taskStatus';
import { ActiveStatus } from '../../interfaces/userRole';


const getAllManager = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.ManagerWhereInput[] = [
    {
      isDeleted: false
    },
  ];

  if (searchTerm) {
    andConditions.push({
      OR: managerSearchAbleFields.map((field) => ({
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

  const whereConditions: Prisma.ManagerWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.manager.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
  });

  const total = await prisma.manager.count({ where: whereConditions });

  return {
    meta: { page, limit, total },
    data: result,
  };
};


const softDeleteManager = async (id: string): Promise<Manager> => {
  // 1. check manager exists
  const manager = await prisma.manager.findUnique({ where: { id } });
  if (!manager) {
    throw new AppError(httpStatus.NOT_FOUND, "Manager not found");
  }

  // 2. check manager has any assigned active tasks (PENDING or IN_PROGRESS)
  const hasAssignedActiveTasks = await prisma.task.findFirst({
    where: {
      assignedByManagerId: id,
      status: { in: [TaskStatus.IN_PROGRESS,TaskStatus.PENDING] }, // TaskStatus enum strings
    },
  });

  if (hasAssignedActiveTasks) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Manager has assigned tasks in progress. Reassign or complete them first."
    );
  }

  // 3. perform soft-delete transaction: mark manager deleted + deactivate related user
  return prisma.$transaction(async (tx) => {
    const deletedManager = await tx.manager.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    // Manager.user relation: manager.id === user.id (per your schema)
    await tx.user.update({
      where: { email:deletedManager.email },
      data: { status:ActiveStatus.DELETED }, 
    });

    return deletedManager;
  });
};

const getManagerById = async (id: string) => {
  return prisma.manager.findFirstOrThrow({
    where: {
      id,
      isDeleted: false,
      user: {
        status: ActiveStatus.ACTIVE,
      },
    },
    include: {
      assignedTasks: true,
    },
  });
};


export const managerService = {
  getAllManager,
  softDeleteManager,getManagerById
};

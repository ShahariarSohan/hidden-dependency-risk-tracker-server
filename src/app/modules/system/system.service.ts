/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { Request } from "express";
import { prisma } from "../../config/prisma";
import AppError from "../../errorHelpers/AppError";
import { Prisma, System } from "../../../../prisma/generated/client";
import { systemSearchAbleFields } from "./system.constant";
import { paginationHelper } from "../../shared/paginationHelper";
import { IPaginationOptions } from "../../interfaces/pagination";
import { TaskStatus } from "../../interfaces/taskStatus";
import { ActiveStatus } from "../../interfaces/userRole";

const createSystem = async (req: Request) => {
  const isTeamExist = await prisma.team.findFirst({
    where: {
      id: req.body.teamId,
    },
  });
  if (!isTeamExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "Team does't exist");
  }
  const isSystemExist = await prisma.system.findFirst({
    where: {
      name: req.body.name,
      teamId: req.body.teamId,
    },
  });
  if (isSystemExist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "One system must be handle by unique team"
    );
  }

  const result = await prisma.system.create({
    data: req.body,
  });

  return result;
};
const getAllSystem = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.SystemWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: systemSearchAbleFields.map((field) => ({
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

  const whereConditions: Prisma.SystemWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.system.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
  });

  const total = await prisma.system.count({ where: whereConditions });

  return {
    meta: { page, limit, total },
    data: result,
  };
};
const softDeleteSystem = async (id: string): Promise<System> => {
  const system = await prisma.system.findUnique({ where: { id } });
  if (!system) {
    throw new AppError(httpStatus.NOT_FOUND, "System not found");
  }

  // Check for active tasks on the system (PENDING or IN_PROGRESS)
  const activeTask = await prisma.task.findFirst({
    where: {
      systemId: id,
      status: { in: [TaskStatus.IN_PROGRESS, TaskStatus.PENDING] },
    },
  });

  if (activeTask) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "System has active tasks. Reassign or complete them first."
    );
  }

  // Option: prevent soft-delete if system is still assigned to a team
  if (system.teamId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "System is assigned to a team. Unassign or reassign the system before deletion."
    );
  }

  // Soft-delete
  return prisma.system.update({
    where: { id },
    data: {
      status: "INACTIVE",
    },
  });
};
const getSystemById = async (id: string) => {
  return prisma.system.findFirstOrThrow({
    where: {
      id,
      status: ActiveStatus.ACTIVE,
    },
    include: {
      team: true,
      tasks: true,
    },
  });
};
const updateSystemStatus = async (id: string, status: ActiveStatus) => {
  return prisma.system.update({
    where: { id },
    data: { status },
  });
};

export const systemService = {
  createSystem,
  getAllSystem,
  softDeleteSystem,
  getSystemById,
  updateSystemStatus,
};

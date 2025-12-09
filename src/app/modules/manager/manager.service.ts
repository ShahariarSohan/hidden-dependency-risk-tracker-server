import httpStatus from "http-status-codes";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Manager, Prisma } from "../../../../prisma/generated/client";
import { prisma } from "../../config/prisma";
import AppError from "../../errorHelpers/AppError";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../shared/paginationHelper";
import { managerSearchAbleFields } from "./manager.constant";
import { TaskStatus } from "../../interfaces/taskStatus";
import { ActiveStatus } from "../../interfaces/userRole";
import { IAuthUser } from "../../interfaces/user.interface";

const getAllManager = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.ManagerWhereInput[] = [
    {
      isDeleted: false,
      status: { not: ActiveStatus.DELETED },
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
      status: { in: [TaskStatus.IN_PROGRESS, TaskStatus.PENDING] }, // TaskStatus enum strings
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
        status: ActiveStatus.DELETED,
      },
    });

    // Manager.user relation: manager.id === user.id (per your schema)
    await tx.user.update({
      where: { email: deletedManager.email },
      data: { status: ActiveStatus.DELETED },
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
const updateManagerStatus = async (
  managerId: string,
  status: ActiveStatus.ACTIVE | ActiveStatus.INACTIVE
) => {
  const manager = await prisma.manager.findUnique({ where: { id: managerId } });
  if (!manager) {
    throw new AppError(httpStatus.NOT_FOUND, "Manager not found");
  }
  return prisma.$transaction(async (tx) => {
    // 1. Update MANAGER
    const updatedManager = await tx.manager.update({
      where: { id: managerId },
      data: { status },
    });

    // 2. Sync USER status
    await tx.user.updateMany({
      where: { email: updatedManager.email },
      data: { status },
    });

    return updatedManager;
  });
};
const addManagerToTeam = async (managerId: string, teamId: string) => {
  // Check if manager exists and not deleted
  const manager = await prisma.manager.findFirst({
    where: { id: managerId, isDeleted: false },
  });
  if (!manager) {
    throw new AppError(httpStatus.NOT_FOUND, "Manager not found");
  }

  // Check if manager user is active
  const isManagerActive = await prisma.user.findFirst({
    where: { email: manager.email, status: ActiveStatus.ACTIVE },
  });
  if (!isManagerActive) {
    throw new AppError(httpStatus.NOT_FOUND, "Manager is inactive");
  }

  // Check if team exists and is active
  const team = await prisma.team.findFirst({
    where: { id: teamId, status: ActiveStatus.ACTIVE },
  });
  if (!team) {
    throw new AppError(httpStatus.NOT_FOUND, "Team not found or inactive");
  }

  // Check if manager is already assigned to this team
  if (manager.teamId === teamId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Manager is already assigned to this team"
    );
  }

  // Assign manager to team
  const updatedManager = await prisma.manager.update({
    where: { id: managerId },
    data: { teamId },
  });

  return updatedManager;
};
const getManagerTeamOverview = async (user: IAuthUser) => {
   const userInfo = await prisma.user.findUnique({
     where: {
       email: user?.email,
       status: ActiveStatus.ACTIVE,
     },
   });
   if (!userInfo) {
     throw new AppError(httpStatus.BAD_REQUEST, "User not found");
   }
    const manager = await prisma.manager.findUniqueOrThrow({
      where: { email: userInfo.email },
      select: {
        id: true,
        name: true,
        email: true,
        contactNumber: true,
        teamId: true,
      },
    });

   if (!manager.teamId) {
      return {
        manager,
        team: null,
        employees: [],
        systems: [],
      };
    }

    const team = await prisma.team.findUniqueOrThrow({
      where: { id: manager.teamId },
      select: {
        id: true,
        name: true,
        status: true,
        employees: {
          where: { isDeleted: false, status: ActiveStatus.ACTIVE },
          select: {
            id: true,
            name: true,
            email: true,
            contactNumber: true,
          },
        },
        systems: {
          where: { status: ActiveStatus.ACTIVE },
          select: {
            id: true,
            name: true,
            criticality: true,
          },
        },
      },
    });

    return {
      manager,
      team: {
        id: team.id,
        name: team.name,
        status: team.status,
      },
      employees: team.employees,
      systems: team.systems,
    };
  }
export const managerService = {
  getAllManager,
  softDeleteManager,
  getManagerById,
  updateManagerStatus,
  addManagerToTeam,
  getManagerTeamOverview
};

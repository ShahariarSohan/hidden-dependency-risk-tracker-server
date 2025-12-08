/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { Request } from "express";
import { prisma } from "../../config/prisma";
import AppError from "../../errorHelpers/AppError";
import { Prisma, Team } from "../../../../prisma/generated/client";
import { teamSearchAbleFields } from "./team.constant";
import { paginationHelper } from "../../shared/paginationHelper";
import { IPaginationOptions } from "../../interfaces/pagination";
import { ActiveStatus } from "../../interfaces/userRole";

const createTeam = async (req: Request) => {
  const isTeamExist = await prisma.team.findFirst({
    where: {
      name: req.body.name,
    },
  });
  if (isTeamExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "Team already exist");
  }

  const result = await prisma.team.create({
    data: req.body,
  });

  return result;
};
const getAllTeam = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.TeamWhereInput[] = [
    {
      status: {
        not: ActiveStatus.DELETED,
      },
    },
  ];

  if (searchTerm) {
    andConditions.push({
      OR: teamSearchAbleFields.map((field) => ({
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

  const whereConditions: Prisma.TeamWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.team.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
  });

  const total = await prisma.team.count({ where: whereConditions });

  return {
    meta: { page, limit, total },
    data: result,
  };
};
// services/team.service.ts

const softDeleteTeam = async (id: string): Promise<Team> => {
  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) {
    throw new AppError(httpStatus.NOT_FOUND, "Team not found");
  }

  // Check active employees in team (not soft-deleted)
  const activeEmployee = await prisma.employee.findFirst({
    where: {
      teamId: id,
      isDeleted: false, // or status: ACTIVE depending on your flags
    },
  });

  if (activeEmployee) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Team has active employees. Remove or deactivate them first."
    );
  }

  // Check systems owned by team (optionally require systems to be inactive or moved)
  const ownedSystem = await prisma.system.findFirst({
    where: {
      teamId: id,
      // ignore archived/inactive? If you require all systems detached, check teamId only
    },
  });

  if (ownedSystem) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Team owns systems. Reassign or archive systems before deleting the team."
    );
  }

  // Soft-delete team
  return prisma.team.update({
    where: { id },
    data: {
      status: ActiveStatus.DELETED,
    },
  });
};

const getTeamById = async (id: string) => {
  return prisma.team.findFirstOrThrow({
    where: {
      id,
      status: ActiveStatus.ACTIVE,
    },
    include: {
      employees: true,
      systems: true,
    },
  });
};
const updateTeamStatus = async (
  id: string,
  status: ActiveStatus.ACTIVE | ActiveStatus.INACTIVE
) => {
  return prisma.team.update({
    where: { id },
    data: { status },
  });
};
const updateTeamName =
  async (id: string, name: string)=> {
    const existing = await prisma.team.findUnique({ where: { id } });
    if (!existing) throw new AppError(httpStatus.BAD_REQUEST,"Team not found");

    return prisma.team.update({
      where: { id },
      data: { name },
    });
  }

export const teamService = {
  createTeam,
  getAllTeam,
  softDeleteTeam,
  getTeamById,
  updateTeamStatus,
  updateTeamName
};

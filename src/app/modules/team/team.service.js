/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { prisma } from "../../config/prisma";
import AppError from "../../errorHelpers/AppError";
import { teamSearchAbleFields } from "./team.constant";
import { paginationHelper } from "../../shared/paginationHelper";
import { ActiveStatus } from "../../interfaces/userRole";
const createTeam = async (req) => {
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
const getAllTeam = async (params, options) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = params;
    const andConditions = [
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
                    equals: filterData[key],
                },
            })),
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = await prisma.team.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
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
const softDeleteTeam = async (id) => {
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
        throw new AppError(httpStatus.BAD_REQUEST, "Team has active employees. Remove or deactivate them first.");
    }
    // Check systems owned by team (optionally require systems to be inactive or moved)
    const ownedSystem = await prisma.system.findFirst({
        where: {
            teamId: id,
            // ignore archived/inactive? If you require all systems detached, check teamId only
        },
    });
    if (ownedSystem) {
        throw new AppError(httpStatus.BAD_REQUEST, "Team owns systems. Reassign or archive systems before deleting the team.");
    }
    // Soft-delete team
    return prisma.team.update({
        where: { id },
        data: {
            status: ActiveStatus.DELETED,
        },
    });
};
const getTeamById = async (id) => {
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
const updateTeamStatus = async (id, status) => {
    return prisma.team.update({
        where: { id },
        data: { status },
    });
};
export const teamService = {
    createTeam,
    getAllTeam,
    softDeleteTeam,
    getTeamById,
    updateTeamStatus,
};

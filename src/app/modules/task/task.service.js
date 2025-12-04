/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { prisma } from "../../config/prisma";
import AppError from "../../errorHelpers/AppError";
import { ActiveStatus, UserRole } from "../../interfaces/userRole";
import { taskSearchAbleFields } from "./task.constant";
import { paginationHelper } from "../../shared/paginationHelper";
import { TaskStatus } from "../../interfaces/taskStatus";
const createTask = async (req) => {
    const { email, role } = req.user;
    const isEmployeeExist = await prisma.employee.findFirst({
        where: {
            id: req.body.employeeId,
        },
    });
    if (!isEmployeeExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "Employee does't exist");
    }
    const isSystemExist = await prisma.system.findFirst({
        where: {
            id: req.body.systemId,
        },
    });
    if (!isSystemExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "System does't exist");
    }
    let assignedByAdminId = null;
    let assignedByManagerId = null;
    if (role === UserRole.ADMIN) {
        const admin = await prisma.admin.findUnique({ where: { email } });
        if (!admin) {
            throw new AppError(httpStatus.FORBIDDEN, "Admin not found");
        }
        assignedByAdminId = admin.id;
    }
    if (role === UserRole.MANAGER) {
        const manager = await prisma.manager.findUnique({
            where: { email },
        });
        if (!manager) {
            throw new AppError(httpStatus.FORBIDDEN, "Manager not found");
        }
        assignedByManagerId = manager.id;
    }
    const result = await prisma.task.create({
        data: { ...req.body, assignedByAdminId, assignedByManagerId },
    });
    return result;
};
const getAllTask = async (params, options) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = params;
    const andConditions = [
        {
            status: {
                not: TaskStatus.CANCELLED,
            },
        },
    ];
    if (searchTerm) {
        andConditions.push({
            OR: taskSearchAbleFields.map((field) => ({
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
    const result = await prisma.task.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : { createdAt: "desc" },
    });
    const total = await prisma.task.count({ where: whereConditions });
    return {
        meta: { page, limit, total },
        data: result,
    };
};
const softDeleteTask = async (taskId) => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
    });
    if (!task) {
        throw new AppError(httpStatus.NOT_FOUND, "Task not found");
    }
    if (task.status === "DONE") {
        throw new AppError(httpStatus.BAD_REQUEST, "Task is already completed");
    }
    const updated = await prisma.task.update({
        where: { id: taskId },
        data: {
            status: TaskStatus.CANCELLED,
        },
    });
    return updated;
};
const getTaskById = async (id) => {
    return prisma.task.findFirstOrThrow({
        where: {
            id,
            status: {
                not: TaskStatus.CANCELLED,
            },
        },
        include: {
            employee: true,
            assignedByAdmin: true,
            assignedByManager: true,
            system: true,
        },
    });
};
const updateTaskStatus = async (id, status) => {
    const task = await prisma.task.findUniqueOrThrow({
        where: { id },
    });
    // Optional guard (recommended)
    if (task.status === TaskStatus.DONE) {
        throw new AppError(httpStatus.BAD_REQUEST, "Completed task cannot be modified");
    }
    return prisma.task.update({
        where: { id },
        data: {
            status,
            completedAt: status === TaskStatus.DONE ? new Date() : task.completedAt,
        },
    });
};
const getMyAssignedTasks = async (authUser) => {
    // fetch base user
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email: authUser.email,
            status: ActiveStatus.ACTIVE,
        },
    });
    // ADMIN CASE
    if (user.role === UserRole.ADMIN) {
        const admin = await prisma.admin.findUniqueOrThrow({
            where: {
                email: authUser.email,
                isDeleted: false,
            },
        });
        return prisma.task.findMany({
            where: {
                assignedByAdminId: admin.id,
                status: {
                    not: TaskStatus.CANCELLED,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                employee: true,
                system: true,
            },
        });
    }
    // MANAGER CASE
    else if (user.role === UserRole.MANAGER) {
        const manager = await prisma.manager.findUniqueOrThrow({
            where: {
                email: authUser.email,
                isDeleted: false,
            },
        });
        return prisma.task.findMany({
            where: {
                assignedByManagerId: manager.id,
                status: {
                    not: TaskStatus.CANCELLED,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                employee: true,
                system: true,
            },
        });
    }
    //EMPLOYEE CASE
    else if (user.role === UserRole.EMPLOYEE) {
        const employee = await prisma.employee.findUniqueOrThrow({
            where: {
                email: authUser.email,
                isDeleted: false,
            },
        });
        return prisma.task.findMany({
            where: {
                employeeId: employee.id,
                status: {
                    not: TaskStatus.CANCELLED,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                employee: true,
                system: true,
            },
        });
    }
};
export const taskService = {
    createTask,
    getAllTask,
    softDeleteTask,
    getTaskById,
    updateTaskStatus,
    getMyAssignedTasks,
};

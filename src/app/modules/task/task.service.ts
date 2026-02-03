/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { Request } from "express";
import { prisma } from "../../config/prisma";
import AppError from "../../errorHelpers/AppError";
import { ActiveStatus, UserRole } from "../../interfaces/userRole";
import { IAuthUser } from "../../interfaces/user.interface";

import { taskSearchAbleFields } from "./task.constant";
import { paginationHelper } from "../../shared/paginationHelper";
import { IPaginationOptions } from "../../interfaces/pagination";
import { TaskStatus } from "../../interfaces/taskStatus";
import { Prisma, Task } from "@prisma/client";

const createTask = async (req: Request & { user?: IAuthUser }) => {
  const { email, role } = req.user as IAuthUser;

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
const getAllTask = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;
if (filterData.priority) {
  filterData.priority = Number(filterData.priority);
  }
  const andConditions: Prisma.TaskWhereInput[] = [
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
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.TaskWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.task.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      employee: true,
      system: true,
      assignedByAdmin: true,
      assignedByManager: true,
    },
  });

  const total = await prisma.task.count({ where: whereConditions });

  return {
    meta: { page, limit, total },
    data: result,
  };
};
const softDeleteTask = async (taskId: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  if (task.status === "COMPLETED") {
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
const getTaskById = async (id: string) => {
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
const updateTaskStatus = async (id: string, status: TaskStatus.PENDING|TaskStatus.IN_PROGRESS|TaskStatus.COMPLETED) => {
  const task = await prisma.task.findUniqueOrThrow({
    where: { id },
  });

  // Optional guard (recommended)
  if (task.status === TaskStatus.COMPLETED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Completed task cannot be modified"
    );
  }

  return prisma.task.update({
    where: { id },
    data: {
      status,
      completedAt: status === TaskStatus.COMPLETED ? new Date() : task.completedAt,
    },
  });
};
const getMyAssignedTasks = async (authUser: IAuthUser) => {
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

 const updateTask = async (taskId: string, data: Partial<Task>) => {
  // Fetch the task first
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new AppError(404, "Task not found");
if (task.status === "COMPLETED") {
    throw new AppError(httpStatus.BAD_REQUEST, "Task is already completed");
  }
  // Validate dueDate
  if (data.dueDate && new Date(data.dueDate) < task.createdAt) {
    throw new AppError(400, "Due date cannot be earlier than task creation date");
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId, status: { in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] } },
    data: {
      title: data.title,
      description: data.description,
      priority:Number(data.priority),
      workWeight:Number(data.workWeight),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
  });

  return updatedTask;
};
const getAllMyTasksPagination = async (
  email: string,
  params: any,
  options: IPaginationOptions
) => {
  // ---------------------------------------
  // STEP 1: Identify Admin, Manager, Employee
  // ---------------------------------------
  const admin = await prisma.admin.findUnique({ where: { email } });
  const manager = await prisma.manager.findUnique({ where: { email } });
  const employee = await prisma.employee.findUnique({ where: { email } });

  let role: "ADMIN" | "MANAGER" | "EMPLOYEE" | null = null;
  let entityId: string | null = null;

  if (admin) {
    role = "ADMIN";
    entityId = admin.id;
  } else if (manager) {
    role = "MANAGER";
    entityId = manager.id;
  } else if (employee) {
    role = "EMPLOYEE";
    entityId = employee.id;
  } else {
    throw new AppError(httpStatus.NOT_FOUND, "User not found in admin/manager/employee tables");
  }

  // ---------------------------------------
  // STEP 2: Prepare Pagination
  // ---------------------------------------
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  if (filterData.priority) {
    filterData.priority = Number(filterData.priority);
  }

  const andConditions: Prisma.TaskWhereInput[] = [
    {
      status: {
        not: TaskStatus.CANCELLED,
      },
    },
  ];

  // ---------------------------------------
  // STEP 3: Search Filter
  // ---------------------------------------
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

  // ---------------------------------------
  // STEP 4: Dynamic Filters
  // ---------------------------------------
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  // ---------------------------------------
  // STEP 5: Role-based Task Restriction
  // ---------------------------------------
  if (role === "ADMIN") {
    andConditions.push({ assignedByAdminId: entityId });
  } else if (role === "MANAGER") {
    andConditions.push({ assignedByManagerId: entityId });
  } else if (role === "EMPLOYEE") {
    andConditions.push({ employeeId: entityId });
  }

  const whereConditions: Prisma.TaskWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // ---------------------------------------
  // STEP 6: Fetch Paginated Data
  // ---------------------------------------
  const result = await prisma.task.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      employee: true,
      system: true,
      assignedByAdmin: true,
      assignedByManager: true,
    },
  });

  const total = await prisma.task.count({ where: whereConditions });

  return {
    meta: { page, limit, total },
    data: result,
  };
};


export const taskService = {
  createTask,
  getAllTask,
  softDeleteTask,
  getTaskById,
  updateTaskStatus,
  getMyAssignedTasks,
  updateTask,
  getAllMyTasksPagination,
};

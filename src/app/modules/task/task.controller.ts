/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";

import { Request, Response } from "express";
import { taskService } from "./task.service";
import pick from "../../shared/pick";
import { taskFilterableFields } from "./task.constant";
import { paginationTermArray } from "../../shared/paginationConstant";
import { IAuthUser } from "../../interfaces/user.interface";

const createTask = catchAsync(async (req: Request, res: Response) => {
  const result = await taskService.createTask(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task created successfully!",
    data: result,
  });
});
const getAllTask = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, taskFilterableFields);
  const options = pick(req.query, paginationTermArray);

  const result = await taskService.getAllTask(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tasks data fetched!",
    meta: result.meta,
    data: result.data,
  });
});
const softDeleteTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await taskService.softDeleteTask(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task soft deleted successfully",
    data: result,
  });
});
const getTaskById = catchAsync(async (req, res) => {
  const result = await taskService.getTaskById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task fetched successfully",
    data: result,
  });
});
const updateTaskStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const result = await taskService.updateTaskStatus(id, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task status updated successfully",
    data: result,
  });
});
const getMyAssignedTasks = catchAsync(
  async (req: Request & { user?: IAuthUser }, res) => {
    const authUser = req.user as IAuthUser;

    const result = await taskService.getMyAssignedTasks(authUser);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My assigned tasks fetched successfully",
      data: result,
    });
  }
);
const updateTask = catchAsync(async (req: Request, res: Response) => {
  const { taskId } = req.params;

  // Validate body
 

  const updatedTask = await taskService.updateTask(taskId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task updated successfully",
    data: updatedTask,
  });
});
export const getAllMyTasksPagination = catchAsync(
  async (req: Request & { user?: IAuthUser }, res) => {
    const email = (req.user as IAuthUser).email as string; // from IAuthUser

    const filters = pick(req.query, taskFilterableFields);
    const paginationOptions = pick(req.query, paginationTermArray);

    const result = await taskService.getAllMyTasksPagination(
      email,
      filters,
      paginationOptions
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My tasks fetched successfully!",
      meta: result.meta,
      data: result.data,
    });
  }
);
export const taskController = {
  createTask,
  getAllTask,
  softDeleteTask,
  getTaskById,
  updateTaskStatus,
  getMyAssignedTasks,
  updateTask,
  getAllMyTasksPagination,
};

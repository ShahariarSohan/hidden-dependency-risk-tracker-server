import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";

import { Request, Response } from "express";
import { taskService } from "./task.service";
import pick from "../../shared/pick";
import { taskFilterableFields } from "./task.constant";
import { paginationTermArray } from "../../shared/paginationConstant";



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

export const taskController = {
  createTask,
  getAllTask
};

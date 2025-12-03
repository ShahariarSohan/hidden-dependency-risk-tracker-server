import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";

import { Request, Response } from "express";
import { taskService } from "./task.service";



const createTask = catchAsync(async (req: Request, res: Response) => {
  
  const result = await taskService.createTask(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task created successfully!",
    data: result,
  });
});

export const taskController = {
  createTask,
};

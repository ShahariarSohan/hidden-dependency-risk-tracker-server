import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";

import { Request, Response } from "express";
import { systemService } from "./system.service";

const createSystem = catchAsync(async (req: Request, res: Response) => {
  const result = await systemService.createSystem(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "system created successfully!",
    data: result,
  });
});

export const systemController = {
  createSystem,
};

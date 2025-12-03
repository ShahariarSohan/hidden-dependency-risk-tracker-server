import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";

import { Request, Response } from "express";
import { systemService } from "./system.service";
import { systemFilterableFields } from "./system.constant";
import { paginationTermArray } from "../../shared/paginationConstant";
import pick from "../../shared/pick";

const createSystem = catchAsync(async (req: Request, res: Response) => {
  const result = await systemService.createSystem(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "system created successfully!",
    data: result,
  });
});
const getAllSystem = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, systemFilterableFields);
  const options = pick(req.query, paginationTermArray);

  const result = await systemService.getAllSystem(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Systems data fetched!",
    meta: result.meta,
    data: result.data,
  });
});

export const systemController = {
  createSystem,
  getAllSystem
};

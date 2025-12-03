import  httpStatus  from 'http-status';
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { managerFilterableFields } from "./manager.constant";
import { paginationTermArray } from "../../shared/paginationConstant";
import sendResponse from '../../shared/sendResponse';
import pick from '../../shared/pick';
import { managerService } from './manager.service';

const getAllManager = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, managerFilterableFields);
  const options = pick(req.query, paginationTermArray);

  const result = await managerService.getAllManager(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Managers data fetched!",
    meta: result.meta,
    data: result.data,
  });
});
const softDeleteManager = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await managerService.softDeleteManager(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Manager soft deleted successfully",
    data: result,
  });
});
export const managerController = {
  getAllManager,
  softDeleteManager,
};
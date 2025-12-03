import  httpStatus  from 'http-status';
import { Request, Response } from "express";
import pick from "../../shared/pick";
import { userFilterableFields } from "../user/user.constant";
import { paginationTermArray } from "../../shared/paginationConstant";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { employeeService } from "./employee.service";

const getAllEmployee = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, paginationTermArray);

  const result = await employeeService.getAllEmployee(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users data fetched!",
    meta: result.meta,
    data: result.data,
  });
});
export const employeeController = {
    getAllEmployee
}
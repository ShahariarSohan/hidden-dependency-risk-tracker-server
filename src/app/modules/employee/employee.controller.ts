import httpStatus from "http-status";
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
const softDeleteEmployee = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await employeeService.softDeleteEmployee(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Employee soft deleted successfully",
    data: result,
  });
});
const getEmployeeById = catchAsync(async (req, res) => {
  const result = await employeeService.getEmployeeById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Employee fetched successfully",
    data: result,
  });
});

export const employeeController = {
  getAllEmployee,
  softDeleteEmployee,
  getEmployeeById,
};

import httpStatus from "http-status-codes";
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { userService } from "./user.service";
import sendResponse from "../../shared/sendResponse";

const createEmployee = catchAsync(async (req: Request, res: Response) => {
  const employeeData = req.body;
  const result = await userService.createEmployee(employeeData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Employee Created successfully!",
    data: result,
  });
});
const createManager = catchAsync(async (req: Request, res: Response) => {
  const managerData = req.body;
  const result = await userService.createManager(managerData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Manager Created successfully!",
    data: result,
  });
});

export const userController = {
  createEmployee,
  createManager,
};

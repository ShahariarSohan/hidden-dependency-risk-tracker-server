import httpStatus from "http-status-codes";
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { userService } from "./user.service";
import sendResponse from "../../shared/sendResponse";
import { IAuthUser } from "../../interfaces/user.interface";
import pick from "../../shared/pick";
import { userFilterableFields } from "./user.constant";
import { paginationTermArray } from "../../shared/paginationConstant";

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
const getMyProfile = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;

    const result = await userService.getMyProfile(user as IAuthUser);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My profile data fetched!",
      data: result,
    });
  }
);

const updateMyProfile = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;

    const result = await userService.updateMyProfile(
      user as IAuthUser,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My profile updated!",
      data: result,
    });
  }
);
const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, paginationTermArray);

  const result = await userService.getAllUser(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users data fetched!",
    meta: result.meta,
    data: result.data,
  });
});
const getUserById = catchAsync(async (req, res) => {
  const result = await userService.getUserById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});
const updateUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const result = await userService.updateUserStatus(id, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User status updated successfully",
    data: result,
  });
});

export const userController = {
  createEmployee,
  createManager,
  getMyProfile,
  updateMyProfile,
  updateUserStatus,
  getAllUser,
  getUserById,
};

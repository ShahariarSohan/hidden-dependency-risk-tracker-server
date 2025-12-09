import { IAuthUser } from './../../interfaces/user.interface';
import  httpStatus  from 'http-status';
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { managerFilterableFields } from "./manager.constant";
import { paginationTermArray } from "../../shared/paginationConstant";
import sendResponse from '../../shared/sendResponse';
import pick from '../../shared/pick';
import { managerService } from './manager.service';
import { ActiveStatus } from '../../interfaces/userRole';
import AppError from '../../errorHelpers/AppError';

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
const updateManagerStatus = catchAsync(async (req, res) => {
  const { managerId } = req.params;
  const { status } = req.body as { status: ActiveStatus.ACTIVE|ActiveStatus.INACTIVE };

  const updatedManager = await managerService.updateManagerStatus(managerId, status);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Manager status updated successfully",
    data: updatedManager,
  });
});

 const addManagerToTeam = catchAsync(
  async (req: Request, res: Response) => {
    const { managerId } = req.params;
    const { teamId } = req.body;

    if (!teamId) {
      throw new AppError(httpStatus.BAD_REQUEST, "teamId is required");
    }

    const result = await managerService.addManagerToTeam(managerId, teamId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Manager added to team successfully",
      data: result,
    });
  }
);
 const getManagerTeamOverview = catchAsync(
   async (req: Request & { user?: IAuthUser }, res: Response) => {
     // you already attach user object from auth middleware
     const user = req.user;
     const result = await managerService.getManagerTeamOverview(user as IAuthUser);
     sendResponse(res, {
       statusCode: httpStatus.OK,
       success: true,
       message: "Manager team overview retrieved successfully",
       data: result,
     });
   })

export const managerController = {
  getAllManager,
  softDeleteManager,
  updateManagerStatus,
  addManagerToTeam,
  getManagerTeamOverview
};
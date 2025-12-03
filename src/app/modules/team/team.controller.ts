import  httpStatus  from 'http-status';
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { teamService } from "./team.service";
import { Request, Response } from 'express';
import { teamFilterableFields } from './team.constant';
import { paginationTermArray } from '../../shared/paginationConstant';
import pick from '../../shared/pick';

const createTeam = catchAsync(async (req: Request, res: Response) => {
  const result = await teamService.createTeam(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "team created successfully!",
    data: result,
  });
});
const getAllTeam = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, teamFilterableFields);
  const options = pick(req.query, paginationTermArray);

  const result = await teamService.getAllTeam(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teams data fetched!",
    meta: result.meta,
    data: result.data,
  });
});
const softDeleteTeam = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await teamService.softDeleteTeam(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Team soft deleted successfully",
    data: result,
  });
});
const getTeamById = catchAsync(async (req, res) => {
  const result = await teamService.getTeamById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Team fetched successfully",
    data: result,
  });
});
const updateTeamStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const result = await teamService.updateTeamStatus(id, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Team status updated successfully",
    data: result,
  });
});

export const teamController = {
  createTeam,
  getAllTeam,softDeleteTeam,getTeamById,updateTeamStatus
}

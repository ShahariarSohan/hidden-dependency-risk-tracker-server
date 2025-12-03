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

export const teamController = {
  createTeam,
  getAllTeam
}

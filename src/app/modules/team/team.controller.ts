import  httpStatus  from 'http-status';
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { teamService } from "./team.service";
import { Request, Response } from 'express';

const createTeam = catchAsync(async (req: Request, res: Response) => {
  const result = await teamService.createTeam(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "team created successfully!",
    data: result,
  });
});

export const teamController = {
    createTeam
}

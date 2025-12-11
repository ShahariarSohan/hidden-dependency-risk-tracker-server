import { Request, Response } from "express";

import sendResponse from "../../shared/sendResponse";
import { riskAnalysisService } from "./riskAnalysis.service";
import catchAsync from "../../shared/catchAsync";
import { riskFilterableFields } from "./riskAnalysis.constant";
import { paginationTermArray } from "../../shared/paginationConstant";
import pick from "../../shared/pick";
import { IAuthUser } from "../../interfaces/user.interface";

const getEmployeeOwnRisk = catchAsync(
  async (req: Request & { user?: IAuthUser }, res) => {
    const user = req.user as IAuthUser;
    const result = await riskAnalysisService.getEmployeeOwnRisk(user);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Employee risk fetched successfully",
      data: result,
    });
  }
);
const getAllEmployeeRisk = catchAsync(async (req, res) => {
  const filters = pick(req.query, riskFilterableFields);
  const options = pick(req.query, paginationTermArray);

  const result = await riskAnalysisService.getAllEmployeeRisk(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Employee risk analysis fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});


const getSystemRisk = catchAsync(async (req: Request, res: Response) => {
  const { systemId } = req.params;
  const result = await riskAnalysisService.getSystemRisk(systemId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "System risk fetched successfully",
    data: result,
  });
});


const getAllSystemRisk = catchAsync(async (req, res) => {
  const filters = pick(req.query, riskFilterableFields);
  const options = pick(req.query, paginationTermArray);

  const result = await riskAnalysisService.getAllSystemRisk(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "System risk analysis fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getManagerTeamRisk = catchAsync (async (req: Request & { user?: IAuthUser }, res) => {
  const user = req.user as IAuthUser;
  console.log("from manager team backend",user)
  const result = await riskAnalysisService.getManagerTeamRisk(user);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Team risk fetched successfully",
    data: result,
  });
});
const getAllTeamRisk = catchAsync(async (req, res) => {
  const filters = pick(req.query, riskFilterableFields);
  const options = pick(req.query, paginationTermArray);

  const result = await riskAnalysisService.getAllTeamRisk(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Team risk analysis fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});
const getRiskDashboard = catchAsync(async (_req: Request, res: Response) => {
  const result = await riskAnalysisService.getRiskDashboard();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Risk dashboard data fetched successfully",
    data: result,
  });
});

export const riskAnalysisController = {
  getEmployeeOwnRisk,
  getSystemRisk,
  getManagerTeamRisk,
  getRiskDashboard,
  getAllEmployeeRisk,
  getAllSystemRisk,
  getAllTeamRisk,
};

import { Request, Response } from "express";

import sendResponse from "../../shared/sendResponse";
import { riskAnalysisService } from "./riskAnalysis.service";
import catchAsync from "../../shared/catchAsync";

const getEmployeeRisk = catchAsync(async (req: Request, res: Response) => {
  const { employeeId } = req.params;
  const result = await riskAnalysisService.getEmployeeRisk(employeeId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Employee risk fetched successfully",
    data: result,
  });
});
const getAllEmployeeRisk = catchAsync(async (req: Request, res: Response) => {
  const result = await riskAnalysisService.getAllEmployeeRisk();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Employees risks fetched successfully",
    data: result,
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

const getAllSystemRisk = catchAsync(async (req: Request, res: Response) => {
  const result = await riskAnalysisService.getAllSystemRisk();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Systems risks fetched successfully",
    data: result,
  });
});
const getTeamRisk = catchAsync(async (req: Request, res: Response) => {
  const { teamId } = req.params;
  const result = await riskAnalysisService.getTeamRisk(teamId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Team risk fetched successfully",
    data: result,
  });
});
const getAllTeamRisk = catchAsync(async (req: Request, res: Response) => {
  const result = await riskAnalysisService.getAllTeamRisk();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Teams risks fetched successfully",
    data: result,
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
  getEmployeeRisk,
  getSystemRisk,
  getTeamRisk,
  getRiskDashboard,
  getAllEmployeeRisk,
  getAllSystemRisk,
  getAllTeamRisk,
};

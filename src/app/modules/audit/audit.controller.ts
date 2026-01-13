import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { Request, Response } from "express";
import { auditService } from "./audit.service";

const getAuditLogs = catchAsync(async (req: Request, res: Response) => {
  const result = await auditService.getAuditLogs();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Audit logs fetched successfully",
    data: result,
  });
});

export const auditController = {
  getAuditLogs,
};

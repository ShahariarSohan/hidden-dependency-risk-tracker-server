import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import pick from "../../shared/pick";
import { paginationTermArray } from "../../shared/paginationConstant";
import { auditFilterableFields } from "./audit.constant";
import { auditService } from "./audit.service";

const getAllAuditLogs = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, paginationTermArray);
  const filters = pick(req.query, auditFilterableFields);

  const result = await auditService.getAllAuditLogs(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Audit logs fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const auditController = {
  getAllAuditLogs,
};

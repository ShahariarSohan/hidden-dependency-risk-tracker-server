import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { systemService } from "./system.service";
import { systemFilterableFields } from "./system.constant";
import { paginationTermArray } from "../../shared/paginationConstant";
import pick from "../../shared/pick";
const createSystem = catchAsync(async (req, res) => {
    const result = await systemService.createSystem(req);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "system created successfully!",
        data: result,
    });
});
const getAllSystem = catchAsync(async (req, res) => {
    const filters = pick(req.query, systemFilterableFields);
    const options = pick(req.query, paginationTermArray);
    const result = await systemService.getAllSystem(filters, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Systems data fetched!",
        meta: result.meta,
        data: result.data,
    });
});
const softDeleteSystem = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await systemService.softDeleteSystem(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "System soft deleted successfully",
        data: result,
    });
});
const getSystemById = catchAsync(async (req, res) => {
    const result = await systemService.getSystemById(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "System fetched successfully",
        data: result,
    });
});
const updateSystemStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const result = await systemService.updateSystemStatus(id, status);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "System status updated successfully",
        data: result,
    });
});
export const systemController = {
    createSystem,
    getAllSystem,
    softDeleteSystem,
    getSystemById,
    updateSystemStatus,
};

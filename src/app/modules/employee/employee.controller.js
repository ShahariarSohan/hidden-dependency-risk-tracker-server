import httpStatus from "http-status";
import pick from "../../shared/pick";
import { paginationTermArray } from "../../shared/paginationConstant";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { employeeService } from "./employee.service";
import AppError from "../../errorHelpers/AppError";
import { employeeFilterableFields } from "./employee.constant";
const getAllEmployee = catchAsync(async (req, res) => {
    const filters = pick(req.query, employeeFilterableFields);
    const options = pick(req.query, paginationTermArray);
    const result = await employeeService.getAllEmployee(filters, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Employees data fetched!",
        meta: result.meta,
        data: result.data,
    });
});
const softDeleteEmployee = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await employeeService.softDeleteEmployee(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Employee soft deleted successfully",
        data: result,
    });
});
const getEmployeeById = catchAsync(async (req, res) => {
    const result = await employeeService.getEmployeeById(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Employee fetched successfully",
        data: result,
    });
});
const addEmployeeToTeam = catchAsync(async (req, res) => {
    const { employeeId } = req.params;
    const { teamId } = req.body;
    if (!teamId) {
        throw new AppError(httpStatus.BAD_REQUEST, "teamId is required");
    }
    const result = await employeeService.addEmployeeToTeam(employeeId, teamId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Employee added to team successfully",
        data: result,
    });
});
export const employeeController = {
    getAllEmployee,
    softDeleteEmployee,
    getEmployeeById,
    addEmployeeToTeam,
};

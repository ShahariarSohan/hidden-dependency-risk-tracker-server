import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { publicService } from "./public.service";

const getLandingStats = catchAsync(async (req: Request, res: Response) => {
  const result = await publicService.getLandingStats();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Landing page stats fetched successfully",
    data: result,
  });
});

export const publicController = {
  getLandingStats,
};

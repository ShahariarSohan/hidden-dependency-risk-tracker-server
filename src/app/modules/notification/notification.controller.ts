import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { Request, Response } from "express";

import { IAuthUser } from "../../interfaces/user.interface";
import { notificationService } from "./notification.service";

const getMyNotifications = catchAsync(async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user as IAuthUser;
  const result = await notificationService.getMyNotifications(user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notifications fetched successfully",
    data: result,
  });
});

export const notificationController = {
  getMyNotifications,
};

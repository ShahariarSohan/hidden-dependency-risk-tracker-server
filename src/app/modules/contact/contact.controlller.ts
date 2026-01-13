/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";



import { contactService } from "./contact.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";

/**
 * Controller for sending contact form email
 */
const sendContactEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await contactService.sendContactEmail(req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Your message has been sent successfully!",
      data,
    });
  }
);

export const contactController = {
  sendContactEmail,
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import  httpStatus  from 'http-status';
import catchAsync from '../../shared/catchAsync';
import { authService } from './auth.service';
import { Request, Response } from 'express';
import { parseExpiryToken } from '../../shared/parseExpiryToken';
import sendResponse from '../../shared/sendResponse';
import { envVariables } from '../../config/env';
const loginUser = catchAsync(async (req: Request, res: Response) => {
 
  const accessTokenMaxAge = parseExpiryToken(
    envVariables.ACCESS_TOKEN_EXPIRES_IN,
    1000 * 60 * 60
  )
  const refreshTokenMaxAge = parseExpiryToken(
    envVariables.REFRESH_TOKEN_EXPIRES_IN,
    1000 * 60 * 60 * 24 * 30
  );
  

  
  
  const result = await authService.loginUser(req.body);
  const { refreshToken, accessToken } = result;
  res.cookie("accessToken", accessToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: accessTokenMaxAge,
  });
  res.cookie("refreshToken", refreshToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: refreshTokenMaxAge,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged in successfully!",
    data: {
        accessToken,
        refreshToken
    },
  });
});
const getMe = catchAsync(
  async (req: Request, res: Response) => {
    const decodedUser = req.cookies;

    const result = await authService.getMe(decodedUser);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User retrieved successfully",
      data: result,
    });
  }
);
export const authController = {
  loginUser,
  getMe
}
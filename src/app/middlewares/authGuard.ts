/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

import AppError from "../errorHelpers/AppError";

import { jwtHelpers } from "../utils/jwtHelpers";
import { envVariables } from "../config/env";

const authGuard = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.headers.authorization || req.cookies.accessToken;

      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        envVariables.ACCESS_TOKEN_SECRET as string
      );

      req.user = verifiedUser;

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default authGuard;

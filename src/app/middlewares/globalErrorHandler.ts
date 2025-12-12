/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";

import AppError from "../errorHelpers/AppError";
import { envVariables } from "../config/env";
import { Prisma } from "@prisma/client";

// Sanitize error to prevent exposing sensitive information in production
const sanitizeError = (error: any) => {
  // Don't expose Prisma errors in production
  if (envVariables.NODE_ENV === "production" && error.code?.startsWith("P")) {
    return {
      message: "Database operation failed",
      errorDetails: null,
    };
  }
  return error;
};

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log({ err });

  let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  const success = false;
  let message = err.message || "Something went wrong!";
  let error = err;

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation Error";
    error = err;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus.CONFLICT;
      message = "Duplicate Key error";
      error = err.meta;
    }
    if (err.code === "P2025") {
      statusCode = httpStatus.NOT_FOUND;
      message = "Requested resource not found";
      error = err;
    }
    if (err.code === "P1001") {
      statusCode = httpStatus.NOT_FOUND;
      message = "Something went wrong";
      error = err;
    }
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    error = err;
  }

  // Sanitize error before sending response
  const sanitizedError = sanitizeError(error);

  res.status(statusCode).json({
    success,
    message,
    error: sanitizedError,
  });
};

export default globalErrorHandler;

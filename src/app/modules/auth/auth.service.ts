/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma";
import { jwtHelpers } from "../../utils/jwtHelpers";
import { envVariables } from "../../config/env";
import { Secret } from "jsonwebtoken";
import { ActiveStatus } from "../../interfaces/userRole";
import AppError from "../../errorHelpers/AppError";

const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: ActiveStatus.ACTIVE,
    },
  });
  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, "Password incorrect!");
  }
  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    envVariables.ACCESS_TOKEN_SECRET as Secret,
    envVariables.ACCESS_TOKEN_EXPIRES_IN as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    envVariables.REFRESH_TOKEN_SECRET as Secret,
    envVariables.REFRESH_TOKEN_EXPIRES_IN as string
  );

  return {
    accessToken,
    refreshToken,
  };
};
const getMe = async (decodedUser: any) => {
  const accessToken = decodedUser.accessToken;
  const decodedData = jwtHelpers.verifyToken(
    accessToken,
    envVariables.ACCESS_TOKEN_SECRET as Secret
  );

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: ActiveStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
          contactNumber: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
          contactNumber: true,
        },
      },
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
          contactNumber: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  return userData;
};

export const authService = {
  loginUser,
  getMe,
};

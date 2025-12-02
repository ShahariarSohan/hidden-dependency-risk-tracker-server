import  httpStatus  from 'http-status';
import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma";
import { jwtHelpers } from "../../utils/jwtHelpers";
import { envVariables } from "../../config/env";
import { Secret } from "jsonwebtoken";
import { ActiveStatus } from "../../interfaces/userRole";
import AppError from "../../errorHelpers/AppError";
const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
      status: ActiveStatus.ACTIVE,
    },
  });
    if (!userData) {
      throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist");
  }
  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new AppError(httpStatus.BAD_REQUEST,"Password incorrect!");
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
export const authService = {
    loginUser
}

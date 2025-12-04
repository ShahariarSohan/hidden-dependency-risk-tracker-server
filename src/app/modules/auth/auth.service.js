/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma";
import { jwtHelpers } from "../../utils/jwtHelpers";
import { envVariables } from "../../config/env";
import { ActiveStatus } from "../../interfaces/userRole";
import AppError from "../../errorHelpers/AppError";
const loginUser = async (payload) => {
    const userData = await prisma.user.findUnique({
        where: {
            email: payload.email,
            status: ActiveStatus.ACTIVE,
        },
    });
    if (!userData) {
        throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist");
    }
    const isCorrectPassword = await bcrypt.compare(payload.password, userData.password);
    if (!isCorrectPassword) {
        throw new AppError(httpStatus.BAD_REQUEST, "Password incorrect!");
    }
    const accessToken = jwtHelpers.generateToken({
        email: userData.email,
        role: userData.role,
    }, envVariables.ACCESS_TOKEN_SECRET, envVariables.ACCESS_TOKEN_EXPIRES_IN);
    const refreshToken = jwtHelpers.generateToken({
        email: userData.email,
        role: userData.role,
    }, envVariables.REFRESH_TOKEN_SECRET, envVariables.REFRESH_TOKEN_EXPIRES_IN);
    return {
        accessToken,
        refreshToken,
    };
};
const getMe = async (decodedUser) => {
    const accessToken = decodedUser.accessToken;
    const decodedData = jwtHelpers.verifyToken(accessToken, envVariables.ACCESS_TOKEN_SECRET);
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

import httpStatus from "http-status";
import AppError from "../errorHelpers/AppError";
import { envVariables } from "../config/env";
import { jwtHelpers } from "../utils/jwtHelpers";
const authGuard = (...roles) => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization || req.cookies.accessToken;
            console.log({ token });
            if (!token) {
                throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");
            }
            const verifiedUser = jwtHelpers.verifyToken(token, envVariables.ACCESS_TOKEN_SECRET);
            req.user = verifiedUser;
            if (roles.length && !roles.includes(verifiedUser.role)) {
                throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");
            }
            next();
        }
        catch (err) {
            next(err);
        }
    };
};
export default authGuard;

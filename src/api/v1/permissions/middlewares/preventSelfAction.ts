import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../common/utils/apiError";
import { ErrorCode } from "../../common/constants/errorCodes";

/**
 * Prevent user from performing an action on deleting itself 
 * Assumes target user id is in req.params.id
 */
export const preventSelfAction = (
    message = "Action not allowed on yourself"
) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new ApiError(
                "Unauthorized request",
                401,
                ErrorCode.UNAUTHORIZED
            );
        }

        if (!req.params?.id) {
            throw new ApiError(
                "Target user not specified",
                400,
                ErrorCode.BAD_REQUEST
            );
        }

        if (req.user.id === req.params.id) {
            throw new ApiError(
                message,
                403,
                ErrorCode.PERMISSION_DENIED
            );
        }

        next();
    };
};

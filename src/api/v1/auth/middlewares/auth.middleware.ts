import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { ApiError } from "../../common/utils/apiError";
import { verifyToken } from "../utils/jwt.util";
import { env } from "../../../../app/config/env";
import { ErrorCode } from "../../common/constants/errorCodes";
import { IAuthUser } from "../models/auth.dto";

/**
 * Middleware: Authenticate requests using JWT
 * - Extracts token from cookies or Authorization header
 * - Verifies and decodes token payload
 * - Attaches `req.user` for downstream authorization checks
 */
export const authenticate = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        const authHeader = req.header("Authorization");

        const token =
            req.cookies?.accessToken ||
            (authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "").trim() : undefined);

        if (!token) {
            throw new ApiError(
                "Unauthorized request – token missing",
                401,
                ErrorCode.TOKEN_MISSING
            );
        }

        let decoded: IAuthUser;
        try {
            decoded = verifyToken(token, env.ACCESS_TOKEN_SECRET) as IAuthUser;
        } catch (error: any) {
            const errorMessage = error?.message?.toLowerCase() || "";

            if (error instanceof ApiError || error?.name === "Error") {
                if (errorMessage.includes("jwt expired") || errorMessage.includes("expired")) {
                    throw new ApiError(
                        "Access token expired",
                        401,
                        ErrorCode.ACCESS_TOKEN_EXPIRED
                    );
                }
            }

            if (error?.name === "TokenExpiredError") {
                throw new ApiError(
                    "Access token expired",
                    401,
                    ErrorCode.ACCESS_TOKEN_EXPIRED
                );
            }

            throw new ApiError(
                "Invalid access token",
                401,
                ErrorCode.TOKEN_INVALID
            );
        }

        if (!decoded?.id) {
            throw new ApiError(
                "Invalid or malformed token payload",
                401,
                ErrorCode.TOKEN_INVALID
            );
        }

        req.user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role,
            status: decoded.status,
            isVerified: decoded.isVerified
        };

        next();
    }
);

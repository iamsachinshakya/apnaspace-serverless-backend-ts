import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../common/utils/apiError";
import { ErrorCode } from "../../common/constants/errorCodes";
import { RolePermissions } from "../constants/permission";
import { UserRole } from "../../auth/models/auth.entity";
import { IAuthUser } from "../../auth/models/auth.dto";

/**
 * Authorization middleware
 * - Admin can perform action on any resource
 * - User can perform action only on own resource
 */
export const authorize = (permission: string) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const user = req.user as IAuthUser | null;
        const targetUserId = req.params.id;

        /** Authentication check */
        if (!user) {
            throw new ApiError(
                "Unauthorized request",
                401,
                ErrorCode.UNAUTHORIZED
            );
        }

        /** Permission (RBAC) check */
        const allowedPermissions = RolePermissions[user.role];

        if (!allowedPermissions) {
            throw new ApiError(
                `Access denied – invalid role: ${user.role}`,
                403,
                ErrorCode.INVALID_ROLE
            );
        }

        if (!allowedPermissions.has(permission)) {
            throw new ApiError(
                "Forbidden – insufficient permissions",
                403,
                ErrorCode.PERMISSION_DENIED
            );
        }

        /** Target validation */
        if (!targetUserId) {
            throw new ApiError(
                "Target user not specified",
                400,
                ErrorCode.BAD_REQUEST
            );
        }

        /** Ownership / admin check */
        const isAdmin = user.role === UserRole.ADMIN;
        const isSelf = user.id === targetUserId;

        if (!isAdmin && !isSelf) {
            throw new ApiError(
                "Forbidden – you can only operate on your own resource",
                403,
                ErrorCode.PERMISSION_DENIED
            );
        }

        next();
    };
};

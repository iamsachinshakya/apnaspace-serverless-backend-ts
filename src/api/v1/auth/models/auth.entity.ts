import { ICreateDto } from "../../common/models/common.dto";

export enum AuthStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",       // user registered but not verified
    SUSPENDED = "suspended",   // temporarily blocked
    DELETED = "deleted",       // account deleted
    BANNED = "banned"          // permanently banned
}

export enum UserRole {
    USER = "user",
    EDITOR = "editor",
    AUTHOR = "author",
    ADMIN = "admin",
}

/**
 * Pure domain model — DB agnostic
 */

export interface IAuthEntity extends ICreateDto {
    id: string;
    username: string;        // UNIQUE, login identifier
    email: string;
    password: string;
    role: UserRole;
    status: AuthStatus;
    isVerified: boolean;
    refreshToken: string | null;
}


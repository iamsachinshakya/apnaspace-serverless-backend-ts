import { AuthStatus, UserRole } from "./auth.entity";

export interface IRegisterData {
    username: string;
    email: string;
    password: string;
    role?: UserRole;
}

export interface ILoginCredentials {
    email: string;
    password: string;
}

export interface IChangePassword {
    password: string;
}

export interface IResetPassword {
    email: string;
    password: string;
}

export interface IAuthUser {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    status: AuthStatus;
    isVerified: boolean;
}

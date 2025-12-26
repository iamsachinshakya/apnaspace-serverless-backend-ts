import { IChangePassword, ILoginCredentials, IRegisterData, IResetPassword } from "../models/auth.dto";
import { IAuthEntity } from "../models/auth.entity";

/**
 * Interface for Auth service.
 * Defines business logic methods for authentication and user management.
 */
export interface IAuthService {
    /**
     * Register a new user.
     * @param data - The registration data including email, username, password, etc.
     * @returns A Promise resolving to the newly created user entity.
     */
    registerUser(data: IRegisterData): Promise<IAuthEntity>;

    /**
     * Authenticate a user with credentials.
     * @param data - The login credentials including email/username and password.
     * @returns A Promise resolving to an object containing the authenticated user,
     *          an access token, and a refresh token.
     */
    loginUser(data: ILoginCredentials): Promise<{
        user: IAuthEntity;
        accessToken: string;
        refreshToken: string;
    }>;

    /**
     * Logout a user by clearing any active sessions or tokens.
     * @param userId - The unique ID of the user to logout.
     * @returns A Promise resolving to the updated user entity.
     */
    logoutUser(userId: string): Promise<IAuthEntity>;

    /**
     * Generate a new access token using a valid refresh token.
     * @param incomingRefreshToken - The refresh token provided by the client.
     * @returns A Promise resolving to an object containing the new access token.
     */
    refreshAccessToken(incomingRefreshToken: string): Promise<{ accessToken: string }>;

    /**
     * Change the password of a user.
     * @param data - new password information.
     * @param userId - The unique ID of the user whose password is to be changed.
     * @returns A Promise resolving to `true` if the password was successfully changed, otherwise `false`.
     */
    changeUserPassword(data: IChangePassword, userId: string): Promise<boolean>

    /**
     * Reset password of a user.
     * @param data - The email and password information.
     * @returns A Promise resolving to `true` if the password was successfully reset, otherwise `false`.
     */
    resetPassword(data: IResetPassword): Promise<boolean>
}

import { Request, Response } from "express";

/**
 * Interface for Auth controller.
 * Defines HTTP request handlers for authentication-related operations.
 */
export interface IAuthController {
    /**
     * Register a new user.
     * @param req - Express request containing registration data.
     * @param res - Express response used to send the result.
     * @returns A Promise resolving to the HTTP response.
     */
    register(req: Request, res: Response): Promise<Response>;

    /**
     * Authenticate a user and issue access & refresh tokens.
     * @param req - Express request containing login credentials.
     * @param res - Express response with authentication result.
     * @returns A Promise resolving to the HTTP response.
     */
    login(req: Request, res: Response): Promise<Response>;

    /**
     * Logout a user by invalidating refresh tokens or sessions.
     * @param req - Express request containing authenticated user context.
     * @param res - Express response confirming logout.
     * @returns A Promise resolving to the HTTP response.
     */
    logout(req: Request, res: Response): Promise<Response>;

    /**
     * Refresh the access token using a valid refresh token.
     * @param req - Express request containing the refresh token.
     * @param res - Express response with a new access token.
     * @returns A Promise resolving to the HTTP response.
     */
    refreshAccessToken(req: Request, res: Response): Promise<Response>;

    /**
     * Change the User password.
     * @param req - Express request containing old and new passwords.
     * @param res - Express response confirming the password change.
     * @returns A Promise resolving to the HTTP response.
     */
    changeUserPassword(req: Request, res: Response): Promise<Response>;

    /**
     * Change the own password of the logout user.
     * @param req - Express request containing old and new passwords.
     * @param res - Express response confirming the password change.
     * @returns A Promise resolving to the HTTP response.
     */
    resetPassword(req: Request, res: Response): Promise<Response>

    /**
     * Get the currently authenticated user's profile.
     * @param req - Express request containing authenticated user data (e.g., from middleware).
     * @param res - Express response with the current user's information.
     * @returns A Promise resolving to the HTTP response.
     */
    getCurrentUser(req: Request, res: Response): Promise<Response>;
}

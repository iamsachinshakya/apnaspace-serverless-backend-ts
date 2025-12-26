import { IAuthEntity } from "../models/auth.entity";

/**
 * Interface for Auth repository.
 * Defines methods for accessing and manipulating auth-related data in the database.
 */
export interface IAuthRepository {
    /**
     * Find a user by email.
     * @param email - The email of the user.
     * @returns A Promise resolving to the user entity or null if not found.
     */
    findByEmail(email: string): Promise<IAuthEntity | null>;

    /**
     * Find a user by username.
     * @param username - The username of the user.
     * @returns A Promise resolving to the user entity or null if not found.
     */
    findByUsername(username: string): Promise<IAuthEntity | null>;

    /**
     * Find a user by ID.
     * @param id - The unique ID of the user.
     * @returns A Promise resolving to the user entity or null if not found.
     */
    findById(id: string): Promise<IAuthEntity | null>;

    /**
     * Create a new user.
     * @param data - The data to create a new user.
     * @returns A Promise resolving to the created user entity or null.
     */
    create(data: IAuthEntity): Promise<IAuthEntity | null>;

    /**
     * Remove the refresh token of a user by their ID.
     * @param id - The unique ID of the user.
     * @returns A Promise resolving to the updated user entity or null.
     */
    removeRefreshTokenById(id: string): Promise<IAuthEntity | null>;

    /**
     * Update a user by ID with partial data.
     * @param id - The unique ID of the user.
     * @param data - Partial data to update the user.
     * @returns A Promise resolving to the updated user entity or null.
     */
    updateById(
        id: string,
        data: Partial<IAuthEntity>
    ): Promise<IAuthEntity | null>;

    /**
     * Delete a user by their ID.
     * @param id - The unique ID of the user.
     * @returns A Promise resolving to the deleted user entity or null.
     */
    deleteById(id: string): Promise<IAuthEntity | null>;
}

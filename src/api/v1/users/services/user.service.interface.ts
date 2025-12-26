import { IQueryParams, PaginatedData } from "../../common/models/common.dto";
import { IFollowUser, IUpdateUser, IUserDashboard, IUserProfile } from "../models/user.dto";
import { IUserEntity } from "../models/user.entity";

/**
 * @interface IUserService
 * Service interface defining user-related business logic.
 * Handles CRUD operations, profile management, follow/unfollow functionality, and user queries.
 */
export interface IUserService {

    /**
     * Create a new user
     * @param data - User entity data
     * @returns The created user
     */
    createUser(data: IUserEntity): Promise<IUserDashboard>;

    /**
     * Get user profile by user ID
     * @param userId - User ID
     * @returns User profile data
     */
    getUserProfile(userId: string): Promise<IUserProfile>;

    /**
     * Fetch all users with optional pagination, search, and sorting
     * @param query - Query parameters
     * @returns Paginated list of users
     */
    getAllUsers(query: IQueryParams): Promise<PaginatedData<IUserDashboard>>;

    /**
     * Get a single user's dashboard data by ID
     * @param userId - User ID
     * @returns User dashboard data
     */
    getUserById(userId: string): Promise<IUserDashboard>;

    /**
     * Update user profile details (name, bio, social links, preferences, etc.)
     * @param userId - User ID
     * @param body - Partial user data to update
     * @returns Updated user dashboard data
     */
    updateAccount(userId: string, body: IUpdateUser): Promise<Partial<IUpdateUser>>;

    /**
     * Update user's avatar/profile image
     * @param userId - User ID
     * @param file - Uploaded file object
     * @returns Updated user dashboard data
     */
    updateAvatar(userId: string, file: Express.Multer.File): Promise<Partial<IUpdateUser>>

    /**
     * Delete a user account
     * @param userId - User ID
     * @returns True if deletion was successful
     */
    deleteUser(userId: string): Promise<boolean>;

    /**
     * Follow another user
     * @param userId - ID of the user performing the follow
     * @param targetUserId - ID of the user to follow
     * @returns True if follow was successful
     */
    followUser(userId: string, targetUserId: string): Promise<boolean>;

    /**
     * Unfollow another user
     * @param userId - ID of the user performing the unfollow
     * @param targetUserId - ID of the user to unfollow
     * @returns True if unfollow was successful
     */
    unfollowUser(userId: string, targetUserId: string): Promise<boolean>;

    /**
     * Get all followers of a user
     * @param userId - User ID
     * @returns Array of follower users
     */
    getFollowers(userId: string): Promise<IFollowUser[]>;

    /**
     * Get all users that the given user is following
     * @param userId - User ID
     * @returns Array of following users
     */
    getFollowing(userId: string): Promise<IFollowUser[]>;
}

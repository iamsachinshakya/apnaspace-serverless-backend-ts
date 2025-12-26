import { IUserEntity } from "../models/user.entity";
import { IFollowCount, IFollowUser, IUpdateUser, IUserDashboard } from "../models/user.dto";
import { IQueryParams, PaginatedData } from "../../common/models/common.dto";

/**
 * @interface IUserRepository
 * Repository interface for managing user-related database operations.
 * Includes CRUD operations, follow/unfollow functionality, and follower/following queries.
 */
export interface IUserRepository {

  /**
   * Create a new user in the database.
   * @param data - User entity data
   * @returns The created user or null if creation failed
   */
  create(data: IUserEntity): Promise<IUserDashboard | null>;

  /**
   * Retrieve all users with optional pagination, search, and sorting.
   * @param params - Query parameters (page, limit, search, sortBy, sortOrder)
   * @returns Paginated list of users
   */
  findAll(params: IQueryParams): Promise<PaginatedData<IUserDashboard>>;

  /**
   * Find a user by their unique ID.
   * @param userId - User ID
   * @returns The user entity or null if not found
   */
  findById(userId: string): Promise<IUserDashboard | null>;

  /**
   * Update a user's account details.
   * @param userId - User ID
   * @param updates - Partial user data to update
   * @returns The updated fields or null if update failed
   */
  updateAccountById(
    userId: string,
    updates: Partial<IUpdateUser>
  ): Promise<Partial<IUpdateUser> | null>;

  /**
   * Delete a user by ID.
   * @param userId - User ID
   * @returns True if deletion was successful, false otherwise
   */
  deleteById(userId: string): Promise<boolean>;

  /**
   * Add a follower to a user's follower list.
   * @param targetUserId - ID of the user to be followed
   * @param followerId - ID of the follower
   * @returns True if successful, false otherwise
   */
  addFollower(targetUserId: string, followerId: string): Promise<boolean>;

  /**
   * Add a following relationship for a user.
   * @param userId - ID of the user following
   * @param targetUserId - ID of the user being followed
   * @returns True if successful, false otherwise
   */
  addFollowing(userId: string, targetUserId: string): Promise<boolean>;

  /**
   * Remove a follower from a user's follower list.
   * @param targetUserId - ID of the user being unfollowed
   * @param followerId - ID of the follower to remove
   * @returns True if successful, false otherwise
   */
  removeFollower(targetUserId: string, followerId: string): Promise<boolean>;

  /**
   * Remove a following relationship for a user.
   * @param userId - ID of the user
   * @param targetUserId - ID of the user being unfollowed
   * @returns True if successful, false otherwise
   */
  removeFollowing(userId: string, targetUserId: string): Promise<boolean>;

  /**
   * Get a list of followers for a user.
   * @param userId - User ID
   * @returns Array of follower user entities
   */
  findFollowers(userId: string): Promise<IFollowUser[]>;

  /**
   * Get a list of users a user is following.
   * @param userId - User ID
   * @returns Array of following user entities
   */
  findFollowing(userId: string): Promise<IFollowUser[]>;

  /**
  * Check if a user is following a target user
  * @param userId - ID of the follower
  * @param targetUserId - ID of the target user
  * @returns true if userId is already following targetUserId
  */
  isFollowing(userId: string, targetUserId: string): Promise<boolean>

  /**
   * Get follower and following counts for a user.
   * @param userId - User ID
   * @returns Object containing followerCount and followingCount, or null if not found
   */
  getFollowCounts(userId: string): Promise<IFollowCount | null>;
}

import { AuthStatus, UserRole } from "../../auth/models/auth.entity";
import { ErrorCode } from "../../common/constants/errorCodes";
import { IQueryParams, PaginatedData } from "../../common/models/common.dto";
import { ApiError } from "../../common/utils/apiError";
import { IFollowUser, IUpdateUser, IUserDashboard, IUserProfile } from "../models/user.dto";
import { IUserEntity } from "../models/user.entity";
import { IUserRepository } from "../repositories/user.repository.interface";
import { uploadOnCloudinary } from "../utils/cloudinary.util";
import { IUserService } from "./user.service.interface";

/**
 * @class UserService
 * Implements IUserService for user-related business logic.
 * Handles CRUD, profile updates, avatar uploads, and follow/unfollow logic.
 */
export class UserService implements IUserService {
  constructor(private readonly userRepository: IUserRepository) { }


  /* -------------------------------------------------------------------------- */
  /*                               GET USER PROFILE                               */
  /* -------------------------------------------------------------------------- */
  async getUserProfile(userId: string): Promise<IUserProfile> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new ApiError("User not found", 404, ErrorCode.USER_NOT_FOUND);

    const counts = await this.userRepository.getFollowCounts(userId);

    return {
      ...user,
      followersCount: counts?.followerCount ?? 0,
      followingCount: counts?.followingCount ?? 0,
      postsCount: 0,
      role: UserRole.USER,
      status: AuthStatus.ACTIVE,
      isVerified: false,
      username: "",
      email: "",
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                                CREATE USER                                   */
  /* -------------------------------------------------------------------------- */
  async createUser(data: IUserEntity): Promise<IUserDashboard> {
    const createdUser = await this.userRepository.create(data);
    if (!createdUser) throw new ApiError("Failed to create user", 400, ErrorCode.BAD_REQUEST);
    return createdUser;
  }

  /* -------------------------------------------------------------------------- */
  /*                               GET ALL USERS                                  */
  /* -------------------------------------------------------------------------- */
  async getAllUsers(query: IQueryParams): Promise<PaginatedData<IUserDashboard>> {
    const result = await this.userRepository.findAll(query);
    if (!result?.data) throw new ApiError("No users found", 404, ErrorCode.USER_NOT_FOUND);
    return result;
  }

  /* -------------------------------------------------------------------------- */
  /*                               GET USER BY ID                                 */
  /* -------------------------------------------------------------------------- */
  async getUserById(userId: string): Promise<IUserDashboard> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new ApiError("User not found", 404, ErrorCode.USER_NOT_FOUND);
    return user;
  }

  /* -------------------------------------------------------------------------- */
  /*                           UPDATE ACCOUNT DETAILS                            */
  /* -------------------------------------------------------------------------- */
  async updateAccount(userId: string, data: IUpdateUser): Promise<Partial<IUpdateUser>> {
    const allowedFields: (keyof IUpdateUser)[] = [
      "fullName", "bio", "socialLinks", "preferences"
    ];

    const updates: Partial<IUpdateUser> = {};
    for (const key of allowedFields) {
      const value = data[key];
      if (value === undefined || value === null) continue;
      if (typeof value === "string" && value.trim() !== "") updates[key] = value.trim() as any;
      if (typeof value === "object") updates[key] = value as any;
    }

    if (Object.keys(updates).length === 0) {
      throw new ApiError("At least one valid field is required to update", 400, ErrorCode.BAD_REQUEST);
    }

    const updatedUser = await this.userRepository.updateAccountById(userId, updates);
    if (!updatedUser) throw new ApiError("User not found", 404, ErrorCode.USER_NOT_FOUND);

    return updatedUser;
  }

  /* -------------------------------------------------------------------------- */
  /*                                UPDATE AVATAR                                 */
  /* -------------------------------------------------------------------------- */
  async updateAvatar(userId: string, file: Express.Multer.File): Promise<Partial<IUpdateUser>> {
    if (!file?.buffer) throw new ApiError("Avatar file is missing", 400, ErrorCode.BAD_REQUEST);

    const uploaded = await uploadOnCloudinary(file.buffer, userId, "avatars");
    if (!uploaded?.secure_url) throw new ApiError("Failed to upload avatar", 400, ErrorCode.BAD_REQUEST);

    const updatedUser = await this.userRepository.updateAccountById(userId, { avatar: uploaded.secure_url });
    if (!updatedUser) throw new ApiError("User not found", 404, ErrorCode.USER_NOT_FOUND);

    return updatedUser;
  }

  /* -------------------------------------------------------------------------- */
  /*                                DELETE USER                                   */
  /* -------------------------------------------------------------------------- */
  async deleteUser(userId: string): Promise<boolean> {
    const deleted = await this.userRepository.deleteById(userId);
    if (!deleted) throw new ApiError("User not found", 404, ErrorCode.USER_NOT_FOUND);
    return true;
  }

  /* -------------------------------------------------------------------------- */
  /*                               FOLLOW USER                                    */
  /* -------------------------------------------------------------------------- */
  async followUser(userId: string, targetUserId: string): Promise<boolean> {
    if (userId === targetUserId) {
      throw new ApiError("You cannot follow yourself", 400, ErrorCode.BAD_REQUEST);
    }

    // Ensure both users exist
    const [user, targetUser] = await Promise.all([
      this.userRepository.findById(userId),
      this.userRepository.findById(targetUserId)
    ]);

    if (!user) {
      throw new ApiError("User not found", 404, ErrorCode.USER_NOT_FOUND);
    }
    if (!targetUser) {
      throw new ApiError("Target user not found", 404, ErrorCode.USER_NOT_FOUND);
    }

    // Check if already following
    const alreadyFollowing = await this.userRepository.isFollowing(userId, targetUserId);
    if (alreadyFollowing) {
      throw new ApiError("Already following this user", 409, ErrorCode.BAD_REQUEST);
    }

    // Add follower and following
    const [addedFollower, addedFollowing] = await Promise.all([
      this.userRepository.addFollower(targetUserId, userId),
      this.userRepository.addFollowing(userId, targetUserId)
    ]);

    if (!addedFollower || !addedFollowing) {
      throw new ApiError("Failed to follow user", 500, ErrorCode.BAD_REQUEST);
    }

    return true;
  }


  /* -------------------------------------------------------------------------- */
  /*                               UNFOLLOW USER                                  */
  /* -------------------------------------------------------------------------- */
  async unfollowUser(userId: string, targetUserId: string): Promise<boolean> {
    if (userId === targetUserId) throw new ApiError("You cannot unfollow yourself", 400, ErrorCode.BAD_REQUEST);

    const [user, targetUser] = await Promise.all([
      this.userRepository.findById(userId),
      this.userRepository.findById(targetUserId)
    ]);

    if (!user) throw new ApiError("User not found", 404, ErrorCode.USER_NOT_FOUND);
    if (!targetUser) throw new ApiError("Target user not found", 404, ErrorCode.USER_NOT_FOUND);

    const removedFollower = await this.userRepository.removeFollower(targetUserId, userId);
    const removedFollowing = await this.userRepository.removeFollowing(userId, targetUserId);

    if (!removedFollower || !removedFollowing) {
      throw new ApiError("Failed to unfollow user", 500, ErrorCode.BAD_REQUEST);
    }

    return true;
  }

  /* -------------------------------------------------------------------------- */
  /*                          GET FOLLOWERS / FOLLOWING                          */
  /* -------------------------------------------------------------------------- */
  async getFollowers(userId: string): Promise<IFollowUser[]> {
    const followers = await this.userRepository.findFollowers(userId);
    if (!followers) return [];
    return followers;
  }

  async getFollowing(userId: string): Promise<IFollowUser[]> {
    const following = await this.userRepository.findFollowing(userId);
    if (!following) return [];
    return following;
  }
}

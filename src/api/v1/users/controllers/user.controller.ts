import { Request, Response } from "express";
import { IUserService } from "../services/user.service.interface";
import { ApiResponse } from "../../common/utils/apiResponse";
import { PAGINATION_PAGE_LIMIT } from "../../common/constants/constants";
import { IUserController } from "./user.controller.interface";
import { ApiError } from "../../common/utils/apiError";
import { ErrorCode } from "../../common/constants/errorCodes";
import { IUpdateUser } from "../models/user.dto";
import { IQueryParams } from "../../common/models/common.dto";
import { email } from "zod";
import { IAuthUser } from "../../auth/models/auth.dto";

export class UserController implements IUserController {
  constructor(private readonly userService: IUserService) { }

  async getUserProfile(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const authUser = req.user as IAuthUser;

    if (!authUser) throw new ApiError("Unauthorized", 401, ErrorCode.UNAUTHORIZED);
    if (!id) throw new ApiError("User ID is required", 400, ErrorCode.BAD_REQUEST);

    let profile = await this.userService.getUserProfile(id);

    profile = {
      ...profile,
      role: authUser.role,
      status: authUser.status,
      isVerified: authUser.isVerified,
      username: authUser.username,
      email: authUser.email,
    }

    return ApiResponse.success(res, "User profile fetched successfully", profile);
  }


  async getAll(req: Request, res: Response): Promise<Response> {
    const query: IQueryParams = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || PAGINATION_PAGE_LIMIT,
      search: (req.query.search as string) || "",
      sortBy: (req.query.sortBy as string) || "createdAt",
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
    };

    const users = await this.userService.getAllUsers(query);

    return ApiResponse.success(res, "Users fetched successfully", users);
  }


  async getById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    if (!id) throw new ApiError("User ID is required", 400, ErrorCode.BAD_REQUEST);

    const user = await this.userService.getUserById(id);

    return ApiResponse.success(res, "User fetched successfully", user);
  }


  async updateAccountDetails(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const updates: IUpdateUser = req.body;

    if (!id) throw new ApiError("User ID is required", 400, ErrorCode.BAD_REQUEST);
    if (!updates || Object.keys(updates).length === 0) throw new ApiError("No update data provided", 400, ErrorCode.BAD_REQUEST);

    const updated = await this.userService.updateAccount(id, updates);

    return ApiResponse.success(res, "Account details updated successfully", updated);
  }


  async updateAvatar(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    if (!id) throw new ApiError("User ID is required", 400, ErrorCode.BAD_REQUEST);
    if (!req.file) throw new ApiError("Avatar image is required", 400, ErrorCode.FILE_NOT_FOUND);

    const updated = await this.userService.updateAvatar(id, req.file);

    return ApiResponse.success(res, "Avatar updated successfully", updated);
  }


  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    if (!id) throw new ApiError("User ID is required", 400, ErrorCode.BAD_REQUEST);

    await this.userService.deleteUser(id);

    return ApiResponse.success(res, "User deleted successfully", null, 204);
  }

  async followUser(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id;
    const { targetUserId } = req.params;

    if (!userId) throw new ApiError("Unauthorized user", 401, ErrorCode.UNAUTHORIZED);
    if (!targetUserId) throw new ApiError("Target user ID is required", 400, ErrorCode.BAD_REQUEST);

    await this.userService.followUser(userId, targetUserId);

    return ApiResponse.success(res, "User followed successfully");
  }

  async unfollowUser(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id;
    const { targetUserId } = req.params;

    if (!userId) throw new ApiError("Unauthorized user", 401, ErrorCode.UNAUTHORIZED);
    if (!targetUserId) throw new ApiError("Target user ID is required", 400, ErrorCode.BAD_REQUEST);

    await this.userService.unfollowUser(userId, targetUserId);

    return ApiResponse.success(res, "User unfollowed successfully");
  }

  async getFollowers(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    if (!id) throw new ApiError("User ID is required", 400, ErrorCode.BAD_REQUEST);

    const followers = await this.userService.getFollowers(id);

    return ApiResponse.success(res, "Followers fetched successfully", followers);
  }

  async getFollowing(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    if (!id) throw new ApiError("User ID is required", 400, ErrorCode.BAD_REQUEST);

    const following = await this.userService.getFollowing(id);

    return ApiResponse.success(res, "Following users fetched successfully", following);
  }
}

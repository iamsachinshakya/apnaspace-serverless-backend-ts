import { Request, Response } from "express";
import { ApiResponse } from "../../common/utils/apiResponse";
import { ApiError } from "../../common/utils/apiError";
import { ErrorCode } from "../../common/constants/errorCodes";
import { secureCookieOptions } from "../utils/auth.util";
import { IAuthController } from "./auth.controller.interface";
import { IAuthService } from "../services/auth.service.interface";

export class AuthController implements IAuthController {
  constructor(private readonly authService: IAuthService) { }

  async register(req: Request, res: Response): Promise<Response> {
    const user = await this.authService.registerUser(req.body);
    return ApiResponse.success(res, "User registered successfully", user, 201);
  }

  async getCurrentUser(req: Request, res: Response): Promise<Response> {
    const user = req.user;

    if (!user) {
      throw new ApiError("User missing", 400, ErrorCode.BAD_REQUEST);
    }
    return ApiResponse.success(res, "Current user fetched successfully", user);
  }


  async login(req: Request, res: Response): Promise<Response> {
    const { user, accessToken, refreshToken } =
      await this.authService.loginUser(req.body);

    res.cookie("accessToken", accessToken, secureCookieOptions);
    res.cookie("refreshToken", refreshToken, secureCookieOptions);

    return ApiResponse.success(res, "User logged in successfully", {
      user,
      accessToken,
      refreshToken,
    });
  }

  async logout(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError("User ID missing", 400, ErrorCode.BAD_REQUEST);
    }

    await this.authService.logoutUser(userId);

    res.clearCookie("accessToken", secureCookieOptions);
    res.clearCookie("refreshToken", secureCookieOptions);

    return ApiResponse.success(res, "User logged out successfully");
  }

  async refreshAccessToken(req: Request, res: Response): Promise<Response> {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    const { accessToken } =
      await this.authService.refreshAccessToken(incomingRefreshToken);

    res.cookie("accessToken", accessToken, secureCookieOptions);

    return ApiResponse.success(res, "Access token refreshed successfully");
  }

  async changeUserPassword(req: Request, res: Response): Promise<Response> {
    const userId = req.params.id;
    const { password } = req.body;

    if (!userId) {
      throw new ApiError("User ID missing in request params", 400, ErrorCode.BAD_REQUEST);
    }
    await this.authService.changeUserPassword({ password }, userId);
    return ApiResponse.success(res, "Password changed successfully");
  }

  async resetPassword(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;
    await this.authService.resetPassword({ email, password });
    return ApiResponse.success(res, "Password reset successfully");
  }
}

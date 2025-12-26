import { env } from "../../../../app/config/env";
import { ErrorCode } from "../../common/constants/errorCodes";
import { ApiError } from "../../common/utils/apiError";
import {
  IAuthUser,
  IChangePassword,
  ILoginCredentials,
  IRegisterData,
  IResetPassword
} from "../models/auth.dto";
import { AuthStatus, IAuthEntity, UserRole } from "../models/auth.entity";
import { IAuthRepository } from "../repositories/auth.repository.interface";
import { comparePassword, hashPassword } from "../utils/bcrypt.util";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
} from "../utils/jwt.util";
import { IAuthService } from "./auth.service.interface";

/**
 * AuthService
 * Handles all authentication-related business logic such as
 * registering, logging in, logging out, refreshing tokens,
 * and changing passwords.
 */
export class AuthService implements IAuthService {
  constructor(private readonly authRepository: IAuthRepository) { }

  async registerUser(data: IRegisterData): Promise<IAuthEntity> {
    const { email, username, password, role } = data;

    if (!email || !username || !password) {
      throw new ApiError(
        "Full name, email, username, and password are required",
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    if (await this.authRepository.findByEmail(email)) {
      throw new ApiError("Email already exists", 409, ErrorCode.USER_ALREADY_EXISTS);
    }

    if (await this.authRepository.findByUsername(username)) {
      throw new ApiError("Username already exists", 409, ErrorCode.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
      throw new ApiError("Failed to hash password", 500, ErrorCode.PASSWORD_HASH_FAILED);
    }

    const newUser: IAuthEntity = {
      email,
      username: username.toLowerCase(),
      password: hashedPassword,
      role: role || UserRole.USER,
      refreshToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: AuthStatus.ACTIVE,
      isVerified: false,
      id: ""
    };

    const createdUser = await this.authRepository.create(newUser);
    if (!createdUser) {
      throw new ApiError("User registration failed", 500, ErrorCode.USER_REGISTRATION_FAILED);
    }

    return this.toEntity(createdUser);
  }

  async loginUser(
    data: ILoginCredentials
  ): Promise<{ user: IAuthEntity; accessToken: string; refreshToken: string }> {
    const { email, password } = data;

    if (!email || !password) {
      throw new ApiError("Email and password are required", 400, ErrorCode.VALIDATION_ERROR);
    }

    const user = await this.authRepository.findByEmail(email);
    if (!user) throw new ApiError("User not found", 404, ErrorCode.USER_NOT_FOUND);
    if (!user.password) throw new ApiError("User password missing", 500, ErrorCode.INTERNAL_SERVER_ERROR);

    if (!(await comparePassword(password, user.password))) {
      throw new ApiError("Invalid credentials", 401, ErrorCode.INVALID_CREDENTIALS);
    }

    if (user.status !== AuthStatus.ACTIVE) {
      throw new ApiError("User account is not active", 403, ErrorCode.USER_INACTIVE);
    }

    const tokens = await this.generateTokenAndAddToUser(user.id);

    const updatedUser = await this.authRepository.findById(user.id);
    if (!updatedUser) throw new ApiError("User not found after login", 404, ErrorCode.USER_NOT_FOUND);

    return {
      user: this.toEntity(updatedUser),
      ...tokens
    };
  }


  async logoutUser(userId: string): Promise<IAuthEntity> {
    if (!userId) throw new ApiError("User ID is required", 400, ErrorCode.VALIDATION_ERROR);

    const user = await this.authRepository.removeRefreshTokenById(userId);
    if (!user) throw new ApiError("fail to logout user!", 500, ErrorCode.INTERNAL_SERVER_ERROR);
    return this.toEntity(user, false);
  }

  /* -------------------------------------------------------
      REFRESH ACCESS TOKEN
  --------------------------------------------------------*/
  async refreshAccessToken(incomingRefreshToken: string): Promise<{ accessToken: string }> {
    if (!incomingRefreshToken) throw new ApiError("Refresh token missing", 401, ErrorCode.REFRESH_TOKEN_MISSING);

    const decoded = verifyToken(incomingRefreshToken, env.REFRESH_TOKEN_SECRET);
    if (!decoded?.id) throw new ApiError("Invalid refresh token", 401, ErrorCode.TOKEN_INVALID);

    const user = await this.authRepository.findById(decoded.id);
    if (!user) throw new ApiError("User not found", 401, ErrorCode.TOKEN_INVALID);

    if (!user.refreshToken || incomingRefreshToken !== user.refreshToken) {
      throw new ApiError("Refresh token mismatch or expired", 401, ErrorCode.REFRESH_TOKEN_MISMATCH);
    }

    if (user.status !== AuthStatus.ACTIVE) {
      throw new ApiError("User account is not active", 403, ErrorCode.USER_INACTIVE);
    }

    const payload: IAuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      username: user.username,
      isVerified: user.isVerified
    };

    return { accessToken: generateAccessToken(payload) };
  }

  /* -------------------------------------------------------
      CHANGE PASSWORD BY ADMIN
  --------------------------------------------------------*/
  async changeUserPassword(data: IChangePassword, userId: string): Promise<boolean> {
    const { password } = data;

    const user = await this.authRepository.findById(userId);
    if (!user) throw new ApiError("User not found or invalid", 404, ErrorCode.USER_NOT_FOUND);
    if (user.status !== AuthStatus.ACTIVE) throw new ApiError("User account is not active", 403, ErrorCode.USER_INACTIVE);

    const hashed = await hashPassword(password);
    if (!hashed) throw new ApiError("Password hashing failed", 500, ErrorCode.PASSWORD_HASH_FAILED);

    const updateRes = await this.authRepository.updateById(user.id, { password: hashed });
    if (!updateRes) throw new ApiError("Fail to change your password!", 500, ErrorCode.INTERNAL_SERVER_ERROR);
    return true;
  }


  /* -------------------------------------------------------
    RESET PASSWORD BY USER
--------------------------------------------------------*/
  async resetPassword(data: IResetPassword): Promise<boolean> {
    const { email, password } = data;

    const user = await this.authRepository.findByEmail(email);
    if (!user) throw new ApiError("User not found or invalid", 404, ErrorCode.USER_NOT_FOUND);
    if (user.status !== AuthStatus.ACTIVE) throw new ApiError("User account is not active", 403, ErrorCode.USER_INACTIVE);

    const hashed = await hashPassword(password);
    if (!hashed) throw new ApiError("Password hashing failed", 500, ErrorCode.PASSWORD_HASH_FAILED);

    const updateRes = await this.authRepository.updateById(user.id, { password: hashed });
    if (!updateRes) throw new ApiError("Fail to change your password!", 500, ErrorCode.INTERNAL_SERVER_ERROR);
    return true;
  }

  /* -------------------------------------------------------
      GENERATE TOKENS + SAVE REFRESH TOKEN
  --------------------------------------------------------*/
  private async generateTokenAndAddToUser(
    userId: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.authRepository.findById(userId);
    if (!user) throw new ApiError("User not found", 404, ErrorCode.USER_NOT_FOUND);

    const payload: IAuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      username: user.username,
      isVerified: user.isVerified
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ id: user.id });

    const updateRes = await this.authRepository.updateById(user.id, { refreshToken, updatedAt: new Date() });
    if (!updateRes) throw new ApiError("Fail to update generate token!", 500, ErrorCode.INTERNAL_SERVER_ERROR)
    return { accessToken, refreshToken };
  }

  /* -------------------------------------------------------
        ENTITY TRANSFORMER
  --------------------------------------------------------*/
  private toEntity(record: any, includeSensitive = false): IAuthEntity {
    const { password, refreshToken, ...safe } = record;

    const entity: IAuthEntity = {
      ...safe,
      id: record.id.toString(),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    if (includeSensitive) {
      entity.password = password;
      entity.refreshToken = refreshToken;
    }

    return entity;
  }
}

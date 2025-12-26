import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { env } from "../../../../app/config/env";
import { ApiError } from "../../common/utils/apiError";
import { parseExpiry } from "../../common/utils/common.util";
import { IAuthUser } from "../models/auth.dto";

/**
 * Generate an access token
 * @param payload - User data to encode (e.g. { id, email })
 * @returns JWT access token as string
 */
export const generateAccessToken = (payload: IAuthUser): string => {
  if (!env.ACCESS_TOKEN_SECRET) {
    throw new ApiError("ACCESS_TOKEN_SECRET is not defined", 500);
  }

  const options: SignOptions = { expiresIn: parseExpiry(env.ACCESS_TOKEN_EXPIRY) };
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, options);
};

/**
 * Generate a refresh token
 * @param payload - User data to encode
 * @returns JWT refresh token as string
 */
export const generateRefreshToken = (payload: object): string => {
  if (!env.REFRESH_TOKEN_SECRET) {
    throw new ApiError("REFRESH_TOKEN_SECRET is not defined", 500);
  }

  const options: SignOptions = { expiresIn: parseExpiry(env.REFRESH_TOKEN_EXPIRY) };
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, options);
};

/**
 * Verify and decode a JWT token
 * @param token - JWT token string
 * @param secret - Secret key used for verification
 * @returns Decoded payload (JwtPayload)
 * @throws ApiError if verification fails
 */
export const verifyToken = (token: string, secret: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === "string") {
      throw new ApiError("Invalid token payload", 401);
    }

    return decoded;
  } catch (err: any) {
    throw new ApiError(`Invalid or expired token: ${err.message}`, 401);
  }
};

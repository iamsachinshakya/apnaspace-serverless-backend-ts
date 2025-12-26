import { Request, Response, NextFunction } from "express";
import { env } from "../../../../app/config/env";
import { ApiResponse } from "../utils/apiResponse";
import logger from "../../../../app/utils/logger";
import { ApiError } from "../utils/apiError";
import { Environment } from "../../../../app/config/constants";
import { ErrorCode } from "../constants/errorCodes";

/**
 * Global error-handling middleware for Express
 */
export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  const error = err as any;

  logger.error("🔥 Error:", {
    message: error?.message,
    stack: error?.stack,
    errorCode: error?.errorCode,
    errors: error?.errors,
  });

  /* ---------------------------------------------------------
     ✅ HANDLE CUSTOM ApiError (Operational Errors)
  ----------------------------------------------------------*/
  if (error instanceof ApiError && error.isOperational) {
    return ApiResponse.error(
      res,
      error.message,
      error.statusCode,
      error.errors ?? null,
      error.errorCode
    );
  }

  /* ---------------------------------------------------------
     ❌ HANDLE UNKNOWN / UNEXPECTED ERRORS
  ----------------------------------------------------------*/
  const isDev = env.NODE_ENV === Environment.DEVELOPMENT;

  const safeMessage = isDev
    ? error?.stack || error?.message || "Unexpected internal error"
    : "Something went wrong! Please try again later.";

  return ApiResponse.error(
    res,
    safeMessage,
    500,
    null,
    ErrorCode.INTERNAL_SERVER_ERROR
  );
};

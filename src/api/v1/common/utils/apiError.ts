import { ErrorCode } from "../constants/errorCodes";

/**
 * Custom error class for handling operational (expected) errors gracefully.
 */
export class ApiError extends Error {
  public statusCode: number;
  public success: boolean;
  public errors: any | null;
  public errorCode: ErrorCode;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    errors: any = null
  ) {
    super(message);

    // Assign class properties
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.errorCode = errorCode;
    this.isOperational = true;

    // Fix prototype chain (required for TS inheritance)
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

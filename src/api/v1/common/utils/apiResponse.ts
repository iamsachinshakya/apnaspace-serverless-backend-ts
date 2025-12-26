import { Response } from "express";
import { ErrorCode } from "../constants/errorCodes";

/**
 * Standard API response helper for consistent response structure.
 */
export class ApiResponse {
  public success: boolean;
  public message: string;
  public statusCode: number;
  public data?: any;
  public meta?: any;
  public errors?: any;
  public errorCode?: ErrorCode;

  constructor({
    success,
    message,
    data,
    statusCode = 200,
    meta,
    errors,
    errorCode,
  }: {
    success: boolean;
    message: string;
    data?: any;
    statusCode?: number;
    meta?: any;
    errors?: any;
    errorCode?: ErrorCode;
  }) {
    this.success = success;
    this.message = message;
    this.statusCode = statusCode;

    if (data !== undefined) this.data = data;
    if (meta !== undefined) this.meta = meta;
    if (errors !== undefined) this.errors = errors;
    if (errorCode !== undefined) this.errorCode = errorCode;
  }

  /**
   * Send a successful response
   */
  static success(
    res: Response,
    message: string = "Success",
    data: any = null,
    statusCode: number = 200,
    meta: any = null
  ) {
    const response = new ApiResponse({
      success: true,
      message,
      data,
      statusCode,
      meta,
    });

    return res.status(statusCode).json(response);
  }

  /**
   * Send an error response (compatible with ApiError)
   */
  static error(
    res: Response,
    message: string = "Error",
    statusCode: number = 500,
    errors: any = null,
    errorCode?: ErrorCode
  ) {
    const response = new ApiResponse({
      success: false,
      message,
      statusCode,
      errors,
      errorCode,
    });

    return res.status(statusCode).json(response);
  }
}

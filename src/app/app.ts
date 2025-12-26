import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";

import { stream } from "./utils/logger";
import { env, isDevelopment } from "./config/env";
import { ApiError } from "../api/v1/common/utils/apiError";
import { errorMiddleware } from "../api/v1/common/middlewares/error.middleware";
import { ApiResponse } from "../api/v1/common/utils/apiResponse";
import { authRouter } from "../api/v1/auth/routes/auth.route";
import { userRouter } from "../api/v1/users/routes/user.routes";

const app = express();

/**
 * Middleware
 */
app.use(
    cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(morgan(isDevelopment ? "dev" : "combined", { stream }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

/**
 * Health check
 */
app.get("/", (_req: Request, res: Response) => {
    ApiResponse.success(res, "🚀 Express server running!");
});

/**
 * API routes
 */
// app.use("/api/v1/auth", authRouter);
// app.use("/api/v1/users", userRouter);

/**
 * 404 handler
 */
app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new ApiError(`Route not found: ${req.originalUrl}`, 404));
});

/**
 * Global error handler
 */
app.use(errorMiddleware);

export default app;

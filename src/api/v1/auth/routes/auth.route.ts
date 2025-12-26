import { Router } from "express";
import { validateBody } from "../../common/middlewares/validate.middleware";
import {
  registerUserSchema,
  loginUserSchema,
  resetPasswordSchema,
  changeUserPasswordSchema,
} from "../validations/auth.validation";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";
import { AuthRepository } from "../repositories/auth.repository";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../../permissions/middlewares/authorize.middleware";
import { PERMISSIONS } from "../../permissions/constants/permission";

export const authRouter = Router();

// Proper DI chain
const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

/**
 * @route   GET /api/v1/auth/current-user
 * @desc    Get details of the logged-in user
 * @access  Private
 */
authRouter.get(
  "/me",
  authenticate,
  asyncHandler(authController.getCurrentUser.bind(authController))
);

/**
 * @route POST /api/v1/auth/register
 */
authRouter.post(
  "/register",
  validateBody(registerUserSchema),
  asyncHandler(authController.register.bind(authController))
);

/**
 * @route POST /api/v1/auth/login
 */
authRouter.post(
  "/login",
  validateBody(loginUserSchema),
  asyncHandler(authController.login.bind(authController))
);

/**
 * @route POST /api/v1/auth/refresh-token
 */
authRouter.post(
  "/refresh-token",
  asyncHandler(authController.refreshAccessToken.bind(authController))
);

/**
 * @route POST /api/v1/auth/logout
 */
authRouter.post(
  "/logout",
  authenticate,
  asyncHandler(authController.logout.bind(authController))
);

/**
 * Logout User changes own password
 * @route POST /api/v1/auth/me/change-password
 */
authRouter.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  asyncHandler(authController.resetPassword.bind(authController))
);

/**
 * Admin resets user password
 * @route POST /api/v1/auth/users/:id/change-password
 */
authRouter.post(
  "/users/:id/change-password",
  authenticate,
  authorize(PERMISSIONS.AUTH.CHANGE_PASSWORD),
  validateBody(changeUserPasswordSchema),
  asyncHandler(authController.changeUserPassword.bind(authController))
);

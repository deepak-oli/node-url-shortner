import { Request, Response } from "express";
import { z } from "zod";

import { CustomResponse, getErrorMessage } from "@/utils/response.util";
import { setTokenCookie, clearTokenCookie } from "@/utils/cookie.util";
import * as userService from "@/services/user.service";
import { AuthenticatedRequest } from "@/middlewares/auth.middleware";

const registerSchema = z.object({
  email: z.string().email("Invalid email format."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email format.").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .optional(),
});

export const registerUser = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return CustomResponse.error({
      res,
      statusCode: 400,
      message: "Validation error.",
      data: parsed.error,
      log: false,
    });
  }

  try {
    const user = await userService.registerUser(
      parsed.data.email,
      parsed.data.password,
      parsed.data.name
    );
    return CustomResponse.success({
      res,
      statusCode: 201,
      message: "User registered successfully.",
      data: { user: { id: user.id, email: user.email, name: user.name } },
    });
  } catch (error) {
    return CustomResponse.error({
      res,
      message: getErrorMessage(error),
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return CustomResponse.error({
      res,
      statusCode: 400,
      message: "Validation error.",
      data: parsed.error,
      log: false,
    });
  }

  try {
    const { user, token } = await userService.loginUser(
      parsed.data.email,
      parsed.data.password
    );
    setTokenCookie(res, token);
    return CustomResponse.success({
      res,
      message: "Login successful.",
      data: { user: { id: user.id, email: user.email, name: user.name } },
    });
  } catch (error) {
    return CustomResponse.error({
      res,
      statusCode: 401,
      message: getErrorMessage(error),
    });
  }
};

export const logoutUser = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    clearTokenCookie(res);
    return CustomResponse.success({ res, message: "Logout successful." });
  } catch (error) {
    return CustomResponse.error({
      res,
      message: getErrorMessage(error),
    });
  }
};

export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id;
  if (!userId) {
    return CustomResponse.error({
      res,
      statusCode: 401,
      message: "Unauthorized.",
    });
  }

  try {
    const user = await userService.getUserProfile(userId);
    return CustomResponse.success({ res, data: { user } });
  } catch (error) {
    return CustomResponse.error({
      res,
      message: getErrorMessage(error),
    });
  }
};

export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id;
  if (!userId) {
    return CustomResponse.error({
      res,
      statusCode: 401,
      message: "Unauthorized.",
    });
  }

  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return CustomResponse.error({
      res,
      statusCode: 400,
      message: "Validation error.",
      data: parsed.error,
    });
  }

  try {
    const updatedUser = await userService.updateUserProfile(
      userId,
      parsed.data
    );
    return CustomResponse.success({
      res,
      message: "Profile updated successfully.",
      data: { user: updatedUser },
    });
  } catch (error: any) {
    const statusCode = error.code === "P2025" ? 404 : 500;
    const message =
      error.code === "P2025" ? "User not found." : "Internal server error.";
    return CustomResponse.error({ res, statusCode, message, data: error });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return CustomResponse.error({
      res,
      statusCode: 401,
      message: "Unauthorized.",
    });
  }

  try {
    await userService.deleteUser(userId);
    return CustomResponse.success({
      res,
      message: "User account deleted successfully.",
    });
  } catch (error: any) {
    const statusCode = error.code === "P2025" ? 404 : 500;
    const message =
      error.code === "P2025" ? "User not found." : "Internal server error.";
    return CustomResponse.error({ res, statusCode, message });
  }
};

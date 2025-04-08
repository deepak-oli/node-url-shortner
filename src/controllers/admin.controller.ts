import { Response } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "@/middlewares/auth.middleware";
import { CustomResponse, getErrorMessage } from "@/utils/response.util";
import * as adminService from "@/services/admin.service";
import { Role } from "@prisma/client";

// Validation schemas
const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const getDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const parsed = dateRangeSchema.safeParse(req.query);

  if (!parsed.success) {
    return CustomResponse.error({
      res,
      statusCode: 400,
      message: "Invalid date range.",
      data: parsed.error,
      log: false,
    });
  }

  const { startDate, endDate } = parsed.data;

  try {
    const stats = await adminService.getDashboardStats(startDate, endDate);
    return CustomResponse.success({
      res,
      message: "Dashboard statistics fetched successfully.",
      data: stats,
      log: false,
    });
  } catch (error) {
    return CustomResponse.error({
      res,
      message: getErrorMessage(error),
    });
  }
};

export const getAllUsers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const { users, pagination } = await adminService.getAllUsers(page, limit);
    return CustomResponse.success({
      res,
      message: "Users fetched successfully.",
      data: { users, pagination },
      log: false,
    });
  } catch (error) {
    return CustomResponse.error({
      res,
      message: getErrorMessage(error),
    });
  }
};

export const updateUserRole = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!role || !Object.keys(Role).includes(role)) {
    return CustomResponse.error({
      res,
      statusCode: 400,
      message: `Invalid role. Must be ${Object.keys(Role).join(" or ")}.`,
      log: false,
    });
  }

  try {
    const updatedUser = await adminService.updateUserRole(userId, role);
    return CustomResponse.success({
      res,
      message: "User role updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    return CustomResponse.error({
      res,
      message: getErrorMessage(error),
    });
  }
};

export const getAllUrls = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const { urls, pagination } = await adminService.getAllUrls(page, limit);
    return CustomResponse.success({
      res,
      message: "URLs fetched successfully.",
      data: { urls, pagination },
    });
  } catch (error) {
    return CustomResponse.error({
      res,
      message: getErrorMessage(error),
    });
  }
};

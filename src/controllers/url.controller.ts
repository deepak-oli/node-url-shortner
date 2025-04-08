import { Request, Response } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "@/middlewares/auth.middleware";
import { CustomResponse, getErrorMessage } from "@/utils/response.util";
import * as urlService from "@/services/url.service";

const createUrlSchema = z.object({
  originalUrl: z.string().url("Please provide a valid URL"),
  expiresAt: z.string().datetime().optional(),
  customShortCode: z.string().min(3).max(20).optional(),
});

const updateUrlSchema = z.object({
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const createUrl = async (req: AuthenticatedRequest, res: Response) => {
  const parsed = createUrlSchema.safeParse(req.body);
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
    const { originalUrl, expiresAt, customShortCode } = parsed.data;
    const data = await urlService.createUrl({
      originalUrl,
      expiresAt,
      customShortCode,
      userId: req.user!.id,
    });

    return CustomResponse.success({
      res,
      message: "URL shortened successfully.",
      data,
      statusCode: 201,
    });
  } catch (error) {
    return CustomResponse.error({
      res,
      message: getErrorMessage(error),
    });
  }
};

export const redirectToUrl = async (req: Request, res: Response) => {
  try {
    const targetUrl = await urlService.redirectToUrl({
      shortCode: req.params.shortCode,
      req,
    });
    return res.redirect(targetUrl);
  } catch (error) {
    return CustomResponse.error({
      res,
      message: getErrorMessage(error),
    });
  }
};

export const getUserUrls = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await urlService.getUserUrls({ userId: req.user!.id });
    return CustomResponse.success({ res, data });
  } catch (error) {
    return CustomResponse.error({
      res,
      message: getErrorMessage(error),
    });
  }
};

export const getUrlStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await urlService.getUrlStats({
      id: req.params.id,
      userId: req.user!.id,
      role: req.user!.role,
    });
    return CustomResponse.success({ res, data });
  } catch (error) {
    return CustomResponse.error({
      res,
      message: getErrorMessage(error),
    });
  }
};

export const updateUrl = async (req: AuthenticatedRequest, res: Response) => {
  const parsed = updateUrlSchema.safeParse(req.body);
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
    const data = await urlService.updateUrl({
      id: req.params.id,
      userId: req.user!.id,
      role: req.user!.role,
      updates: parsed.data,
    });

    return CustomResponse.success({
      res,
      message: "URL updated successfully.",
      data,
    });
  } catch (error) {
    return CustomResponse.error({
      res,
      message: getErrorMessage(error),
    });
  }
};

export const deleteUrl = async (req: AuthenticatedRequest, res: Response) => {
  try {
    await urlService.deleteUrl({
      id: req.params.id,
      userId: req.user!.id,
      role: req.user!.role,
    });

    return CustomResponse.success({
      res,
      message: "URL deleted successfully.",
    });
  } catch (error) {
    return CustomResponse.error({
      res,
      message: getErrorMessage(error),
    });
  }
};

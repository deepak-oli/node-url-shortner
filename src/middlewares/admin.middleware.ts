import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@/middlewares/auth.middleware";
import { CustomResponse } from "@/utils/response.util";
import { Role } from "@prisma/client";

export const checkAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== Role.ADMIN) {
    CustomResponse.error({
      res,
      statusCode: 403,
      message: "Forbidden. Admin access required.",
    });
    return;
  }
  next();
};

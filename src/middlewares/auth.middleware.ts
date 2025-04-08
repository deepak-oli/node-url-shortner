import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import prisma from "@/db/client";
import { ENV } from "@/config/env.config";
import { CustomResponse } from "@/utils/response.util";
import { User } from "@prisma/client";

interface DecodedToken {
  sub: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export interface AuthenticatedUser
  extends Pick<User, "id" | "role" | "email"> {}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from cookie instead of header
    const authToken = req.cookies.token;

    // Check if token exists
    if (!authToken) {
      CustomResponse.error({
        res,
        statusCode: 401,
        message: "Authentication required. No token provided.",
        log: false,
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(authToken, ENV.JWT_SECRET!) as DecodedToken;

    const userId = decoded.sub;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Check if user exists
    if (!user) {
      CustomResponse.error({
        res,
        statusCode: 401,
        message: "User not found.",
        log: false,
      });
      return;
    }
    // Attach user to request object
    req.user = {
      id: userId,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof Error && error.name === "TokenExpiredError") {
      CustomResponse.error({
        res,
        statusCode: 401,
        message: "Token expired.",
        log: false,
      });
      return;
    }

    CustomResponse.error({
      res,
      statusCode: 401,
      message: "Invalid token.",
      log: false,
    });
    return;
  }
};

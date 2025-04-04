import prisma from "@/db/client";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface DecodedToken {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: DecodedToken & {
    role: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from cookie instead of header
    const authToken = req.cookies.auth_token;

    // Check if token exists
    if (!authToken) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      authToken,
      process.env.JWT_SECRET!
    ) as DecodedToken;

    const userId = decoded.userId;
    const email = decoded.email;

    const user = await prisma.user.findUnique({
      where: { id: userId, email },
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    // Attach user to request object
    req.user = {
      ...decoded,
      // @ts-expect-error
      role: user.role, // Ensure 'role' exists in your database schema
    };

    next();
  } catch (error) {
    if (error instanceof Error && error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

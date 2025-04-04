// src/controllers/adminController.ts
import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { AuthenticatedRequest } from "@/middlewares/auth.middleware";

const prisma = new PrismaClient();

// Validation schemas
const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Controller functions
export const getDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user?.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
      return;
    }

    const validationResult = dateRangeSchema.safeParse(req.query);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationResult.error.format(),
      });
      return;
    }

    const { startDate, endDate } = validationResult.data;

    // Date filters
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Get total users
    const totalUsers = await prisma.user.count();

    // Get total URLs
    const totalUrls = await prisma.url.count({
      where: startDate || endDate ? { createdAt: dateFilter } : {},
    });

    // Get total clicks/visits
    const totalVisits = await prisma.visit.count({
      where: startDate || endDate ? { visitedAt: dateFilter } : {},
    });

    // Get URLs created per day for the past week
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const urlsCreatedLastWeek = await prisma.url.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: weekAgo,
          lte: today,
        },
      },
      _count: {
        id: true,
      },
    });

    // Format data for chart
    const urlsCreatedByDay = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];

      const entry = urlsCreatedLastWeek.find(
        (item) => item.createdAt.toISOString().split("T")[0] === dateString
      );

      return {
        date: dateString,
        count: entry ? entry._count.id : 0,
      };
    }).reverse();

    // Top 10 most visited URLs
    const topUrls = await prisma.url.findMany({
      orderBy: {
        clicks: "desc",
      },
      take: 10,
      select: {
        id: true,
        originalUrl: true,
        shortCode: true,
        clicks: true,
        createdAt: true,
        isActive: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalUrls,
          totalVisits,
        },
        charts: {
          urlsCreatedByDay,
        },
        topUrls,
      },
    });
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};

export const getAllUsers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user?.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get users with pagination
    const users = await prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        // @ts-expect-error
        role: true,
        createdAt: true,
        _count: {
          select: {
            urls: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get total count for pagination
    const totalUsers = await prisma.user.count();

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total: totalUsers,
          page,
          limit,
          pages: Math.ceil(totalUsers / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

export const updateUserRole = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user?.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
      return;
    }

    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !["USER", "ADMIN"].includes(role)) {
      res.status(400).json({
        success: false,
        message: "Invalid role. Must be USER or ADMIN.",
      });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Don't allow changing own role (for safety)
    if (userId === req.user.userId) {
      res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
      return;
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      // @ts-expect-error
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        // @ts-expect-error
        role: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
    });
  }
};

export const getAllUrls = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user?.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get URLs with pagination
    const urls = await prisma.url.findMany({
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get total count for pagination
    const totalUrls = await prisma.url.count();

    const baseUrl =
      process.env.BASE_URL || req.protocol + "://" + req.get("host");

    const urlsWithShortUrl = urls.map((url) => ({
      ...url,
      shortUrl: `${baseUrl}/${url.shortCode}`,
    }));

    res.status(200).json({
      success: true,
      data: {
        urls: urlsWithShortUrl,
        pagination: {
          total: totalUrls,
          page,
          limit,
          pages: Math.ceil(totalUrls / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching URLs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch URLs",
    });
  }
};

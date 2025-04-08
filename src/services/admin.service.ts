import { z } from "zod";

import { ENV } from "@/config/env.config";
import prisma from "@/db/client";
import { Role } from "@prisma/client";

// Validation schemas
const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const getDashboardStats = async (
  startDate?: string,
  endDate?: string
) => {
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

  return {
    stats: {
      totalUsers,
      totalUrls,
      totalVisits,
    },
    charts: {
      urlsCreatedByDay,
    },
    topUrls,
  };
};

export const getAllUsers = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  // Get users with pagination
  const users = await prisma.user.findMany({
    skip,
    take: limit,
    select: {
      id: true,
      email: true,
      name: true,
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

  return {
    users,
    pagination: {
      total: totalUsers,
      page,
      limit,
      pages: Math.ceil(totalUsers / limit),
    },
  };
};

export const updateUserRole = async (userId: string, role: Role) => {
  if (!Object.values(Role).includes(role)) {
    throw new Error("Invalid role. Must be USER or ADMIN.");
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Don't allow changing own role (for safety)
  if (userId === userId) {
    throw new Error("You cannot change your own role");
  }

  // Update user role
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  return updatedUser;
};

export const getAllUrls = async (page: number, limit: number) => {
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

  const urlsWithShortUrl = urls.map((url) => ({
    ...url,
    shortUrl: `${ENV.BASE_URL}/${url.shortCode}`,
  }));

  return {
    urls: urlsWithShortUrl,
    pagination: {
      total: totalUrls,
      page,
      limit,
      pages: Math.ceil(totalUrls / limit),
    },
  };
};

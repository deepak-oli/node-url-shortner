import { Request } from "express";
import { nanoid } from "nanoid";

import prisma from "@/db/client";
import { redisGet, redisSet } from "@/services/redis.service";
import { ENV } from "@/config/env.config";

interface CreateUrlInput {
  originalUrl: string;
  expiresAt?: string;
  customShortCode?: string;
  userId: string;
}

export const createUrl = async ({
  originalUrl,
  expiresAt,
  customShortCode,
  userId,
}: CreateUrlInput) => {
  const shortCode = customShortCode || nanoid(6);

  if (customShortCode) {
    const existing = await prisma.url.findUnique({
      where: { shortCode: customShortCode },
    });
    if (existing) {
      throw new Error("This short code is already in use.");
    }
  }

  const newUrl = await prisma.url.create({
    data: {
      originalUrl,
      shortCode,
      userId,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  return {
    id: newUrl.id,
    originalUrl: newUrl.originalUrl,
    shortCode: newUrl.shortCode,
    shortUrl: `${ENV.BASE_URL}/${newUrl.shortCode}`,
    expiresAt: newUrl.expiresAt,
    isActive: newUrl.isActive,
    createdAt: newUrl.createdAt,
  };
};

export const redirectToUrl = async ({
  shortCode,
  req,
}: {
  shortCode: string;
  req: Request;
}): Promise<string> => {
  const cached = await redisGet(shortCode);
  if (cached) {
    const url = JSON.parse(cached);
    await recordVisit(url.id, req);
    return url.originalUrl;
  }

  const url = await prisma.url.findUnique({
    where: { shortCode },
  });
  if (!url || !url.isActive || (url.expiresAt && url.expiresAt < new Date())) {
    throw new Error("Invalid or expired URL.");
  }

  await recordVisit(url.id, req);
  await incrementClickCount(url.id);
  await redisSet(shortCode, JSON.stringify(url), { EX: 3600 });

  return url.originalUrl;
};

async function recordVisit(urlId: string, req: Request): Promise<void> {
  await prisma.visit.create({
    data: {
      urlId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] || null,
      referrer: req.headers.referer || null,
    },
  });
}

async function incrementClickCount(urlId: string): Promise<void> {
  await prisma.url.update({
    where: { id: urlId },
    data: { clicks: { increment: 1 } },
  });
}

export const getUserUrls = async ({ userId }: { userId: string }) => {
  const urls = await prisma.url.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return urls.map((url) => ({
    ...url,
    shortUrl: `${ENV.BASE_URL}/${url.shortCode}`,
  }));
};

export const getUrlStats = async ({
  id,
  userId,
  role,
}: {
  id: string;
  userId: string;
  role: string;
}) => {
  const url = await prisma.url.findUnique({
    where: { id },
    include: {
      visits: {
        orderBy: { visitedAt: "desc" },
        take: 100,
      },
    },
  });

  if (!url) throw new Error("URL not found.");
  if (url.userId !== userId && role !== "ADMIN") {
    throw new Error("Unauthorized access.");
  }

  const visitsByDate = url.visits.reduce((acc, visit) => {
    const date = visit.visitedAt.toISOString().split("T")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    url: {
      id: url.id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${ENV.BASE_URL}/${url.shortCode}`,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
      isActive: url.isActive,
    },
    stats: {
      totalClicks: url.clicks,
      lastVisit: url.visits[0]?.visitedAt || null,
      visitsByDate,
    },
    recentVisits: url.visits.map((visit) => ({
      id: visit.id,
      visitedAt: visit.visitedAt,
      ipAddress: visit.ipAddress,
      userAgent: visit.userAgent,
      referrer: visit.referrer,
    })),
  };
};

export const updateUrl = async ({
  id,
  userId,
  role,
  updates,
}: {
  id: string;
  userId: string;
  role: string;
  updates: { isActive?: boolean; expiresAt?: string };
}) => {
  const url = await prisma.url.findUnique({ where: { id } });
  if (!url) throw new Error("URL not found");
  if (url.userId !== userId && role !== "ADMIN") {
    throw new Error("Unauthorized access");
  }

  const updatedUrl = await prisma.url.update({
    where: { id },
    data: {
      isActive: updates.isActive ?? url.isActive,
      expiresAt: updates.expiresAt
        ? new Date(updates.expiresAt)
        : url.expiresAt,
    },
  });

  return {
    id: updatedUrl.id,
    originalUrl: updatedUrl.originalUrl,
    shortCode: updatedUrl.shortCode,
    shortUrl: `${ENV.BASE_URL}/${updatedUrl.shortCode}`,
    expiresAt: updatedUrl.expiresAt,
    isActive: updatedUrl.isActive,
    createdAt: updatedUrl.createdAt,
    updatedAt: updatedUrl.updatedAt,
  };
};

export const deleteUrl = async ({
  id,
  userId,
  role,
}: {
  id: string;
  userId: string;
  role: string;
}) => {
  const url = await prisma.url.findUnique({ where: { id } });
  if (!url) throw new Error("URL not found");
  if (url.userId !== userId && role !== "ADMIN") {
    throw new Error("Unauthorized access.");
  }

  await prisma.visit.deleteMany({ where: { urlId: id } });
  await prisma.url.delete({ where: { id } });
};

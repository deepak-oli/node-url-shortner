import { Request, Response } from "express";
import { z } from "zod";
import { nanoid } from "nanoid";
import { AuthenticatedRequest } from "@/middlewares/auth.middleware";
import prisma from "@/db/client";
import { redisGet, redisSet } from "@/services/redis.service";

// Validation schemas
const createUrlSchema = z.object({
  originalUrl: z.string().url("Please provide a valid URL"),
  expiresAt: z.string().datetime().optional(),
  customShortCode: z.string().min(3).max(20).optional(),
});

const updateUrlSchema = z.object({
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().optional(),
});

// Generate a random short code
const generateShortCode = (): string => {
  return nanoid(6); // 6 characters is a good balance between length and uniqueness
};

// Controller functions
export const createUrl = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const validationResult = createUrlSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationResult.error.format(),
      });
      return;
    }

    const { originalUrl, expiresAt } = validationResult.data;
    let { customShortCode } = validationResult.data;

    // Generate short code if not provided
    const shortCode = customShortCode || generateShortCode();

    // Check if custom short code already exists
    if (customShortCode) {
      const existingUrl = await prisma.url.findUnique({
        where: { shortCode: customShortCode },
      });

      if (existingUrl) {
        res.status(409).json({
          success: false,
          message: "This short code is already in use",
        });
        return;
      }
    }

    // Create new URL
    const newUrl = await prisma.url.create({
      data: {
        originalUrl,
        shortCode,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        userId: req.user?.userId,
      },
    });

    res.status(201).json({
      success: true,
      message: "URL shortened successfully",
      data: {
        id: newUrl.id,
        originalUrl: newUrl.originalUrl,
        shortCode: newUrl.shortCode,
        shortUrl: `${
          process.env.BASE_URL || req.protocol + "://" + req.get("host")
        }/${newUrl.shortCode}`,
        expiresAt: newUrl.expiresAt,
        isActive: newUrl.isActive,
        createdAt: newUrl.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating shortened URL:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create shortened URL",
    });
  }
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

export const redirectToUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { shortCode } = req.params;

    // Check Redis cache first
    const cachedUrl = await redisGet(shortCode);
    if (cachedUrl) {
      const url = JSON.parse(cachedUrl);
      // Record the visit
      await recordVisit(url.id, req);
      // Increment click count
      await incrementClickCount(url.id);
      // Return cached URL data
      res.json({
        success: true,
        data: {
          redirectToUrl: url.originalUrl,
          shortCode: url.shortCode,
        },
      });
      return;
    }

    // Find the URL
    const url = await prisma.url.findUnique({
      where: { shortCode },
    });

    if (!url) {
      res.status(404).json({
        success: false,
        message: "URL not found",
      });
      return;
    }

    // Check if URL is active and not expired
    if (!url.isActive) {
      res.status(410).json({
        success: false,
        message: "This URL has been deactivated",
      });
      return;
    }

    if (url.expiresAt && url.expiresAt < new Date()) {
      res.status(410).json({
        success: false,
        message: "This URL has expired",
      });
      return;
    }

    // Record the visit
    await recordVisit(url.id, req);

    // Increment click count
    await incrementClickCount(url.id);

    // Cache the URL in Redis
    // Set an expiration time for the cache (e.g., 1 hour)
    await redisSet(shortCode, JSON.stringify(url), {
      EX: 3600, // 1 hour in seconds
    });

    // Redirect to the original URL
    res.json({
      success: true,
      data: {
        redirectToUrl: url.originalUrl,
        shortCode: url.shortCode,
      },
    });
  } catch (error) {
    console.error("Error redirecting to URL:", error);
    res.status(500).json({
      success: false,
      message: "Error processing your request",
    });
  }
};

export const getUserUrls = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const urls = await prisma.url.findMany({
      where: {
        userId: req.user?.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const baseUrl = process.env.FRONTEND_URL;

    const urlsWithShortUrl = urls.map((url) => ({
      ...url,
      shortUrl: `${baseUrl}/${url.shortCode}`,
    }));

    res.status(200).json({
      success: true,
      data: urlsWithShortUrl,
    });
  } catch (error) {
    console.error("Error fetching user URLs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch URLs",
    });
  }
};

export const getUrlStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Find URL and check ownership
    const url = await prisma.url.findUnique({
      where: { id },
      include: {
        visits: {
          orderBy: {
            visitedAt: "desc",
          },
          take: 100, // Limit to last 100 visits
        },
      },
    });

    if (!url) {
      res.status(404).json({
        success: false,
        message: "URL not found",
      });
      return;
    }

    // Check if user owns this URL or is admin
    if (url.userId !== req.user?.userId && req.user?.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        message: "You do not have permission to view stats for this URL",
      });
      return;
    }

    // Get some basic stats
    const totalClicks = url.clicks;
    const lastVisit = url.visits[0]?.visitedAt || null;

    // Group visits by date
    const visitsByDate = url.visits.reduce((acc, visit) => {
      const date = visit.visitedAt.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
    }, {} as Record<string, number>);

    res.status(200).json({
      success: true,
      data: {
        url: {
          id: url.id,
          originalUrl: url.originalUrl,
          shortCode: url.shortCode,
          shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
          createdAt: url.createdAt,
          expiresAt: url.expiresAt,
          isActive: url.isActive,
        },
        stats: {
          totalClicks,
          lastVisit,
          visitsByDate,
        },
        recentVisits: url.visits.map((visit) => ({
          id: visit.id,
          visitedAt: visit.visitedAt,
          ipAddress: visit.ipAddress,
          userAgent: visit.userAgent,
          referrer: visit.referrer,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching URL stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch URL statistics",
    });
  }
};

export const updateUrl = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const validationResult = updateUrlSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationResult.error.format(),
      });
      return;
    }

    // Find URL and check ownership
    const url = await prisma.url.findUnique({
      where: { id },
    });

    if (!url) {
      res.status(404).json({
        success: false,
        message: "URL not found",
      });
      return;
    }

    // Check if user owns this URL or is admin
    if (url.userId !== req.user?.userId && req.user?.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        message: "You do not have permission to update this URL",
      });
      return;
    }

    const { isActive, expiresAt } = validationResult.data;

    // Update the URL
    const updatedUrl = await prisma.url.update({
      where: { id },
      data: {
        isActive: isActive !== undefined ? isActive : url.isActive,
        expiresAt: expiresAt ? new Date(expiresAt) : url.expiresAt,
      },
    });

    res.status(200).json({
      success: true,
      message: "URL updated successfully",
      data: {
        id: updatedUrl.id,
        originalUrl: updatedUrl.originalUrl,
        shortCode: updatedUrl.shortCode,
        shortUrl: `${process.env.BASE_URL}/${updatedUrl.shortCode}`,
        expiresAt: updatedUrl.expiresAt,
        isActive: updatedUrl.isActive,
        createdAt: updatedUrl.createdAt,
        updatedAt: updatedUrl.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating URL:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update URL",
    });
  }
};

export const deleteUrl = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Find URL and check ownership
    const url = await prisma.url.findUnique({
      where: { id },
    });

    if (!url) {
      res.status(404).json({
        success: false,
        message: "URL not found",
      });
      return;
    }

    // Check if user owns this URL or is admin
    if (url.userId !== req.user?.userId && req.user?.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        message: "You do not have permission to delete this URL",
      });
      return;
    }

    // Delete all visits first (due to foreign key constraints)
    await prisma.visit.deleteMany({
      where: { urlId: id },
    });

    // Delete the URL
    await prisma.url.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "URL deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting URL:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete URL",
    });
  }
};

import { Router } from "express";
import {
  createUrl,
  deleteUrl,
  getUrlStats,
  getUserUrls,
  redirectToUrl,
  updateUrl,
} from "@/controllers/url.controller";
import { authenticate } from "@/middlewares/auth.middleware";

const router = Router();

// Public routes
router.get("/:shortCode", redirectToUrl);

// Protected routes - require authentication
router.get("/stats/:shortCode", authenticate as any, getUrlStats);
router.post("/", authenticate as any, createUrl);
router.put("/:shortCode", authenticate as any, updateUrl);
router.delete("/:shortCode", authenticate as any, deleteUrl);
router.get("/user-urls", authenticate as any, getUserUrls);

export default router;

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
router.get("/stats/:shortCode", authenticate, getUrlStats);
router.post("/", authenticate, createUrl);
router.put("/:shortCode", authenticate, updateUrl);
router.delete("/:shortCode", authenticate, deleteUrl);
router.get("/user-urls", authenticate, getUserUrls);

export default router;

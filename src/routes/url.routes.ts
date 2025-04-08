import { Router } from "express";
import {
  createUrl,
  deleteUrl,
  getUrlStats,
  getUserUrls,
  updateUrl,
} from "@/controllers/url.controller";
import { authenticate } from "@/middlewares/auth.middleware";

const router: Router = Router();

router.get("/stats/:shortCode", authenticate, getUrlStats);
router.post("/", authenticate, createUrl);
router.put("/:shortCode", authenticate, updateUrl);
router.delete("/:shortCode", authenticate, deleteUrl);
router.get("/user-urls", authenticate, getUserUrls);

export default router;

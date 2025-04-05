import { Router } from "express";

import {
  getAllUrls,
  getAllUsers,
  updateUserRole,
  getDashboardStats,
} from "@/controllers/admin.controller";
import { authenticate } from "@/middlewares/auth.middleware";

const router = Router();

router.get("/dashboard", authenticate, getDashboardStats);
router.get("/users", authenticate, getAllUsers);
router.get("/urls", authenticate, getAllUrls);
router.put("/users/:userId/role", authenticate, updateUserRole);

export default router;

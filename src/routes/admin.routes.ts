import { Router } from "express";

import {
  getAllUrls,
  getAllUsers,
  updateUserRole,
  getDashboardStats,
} from "@/controllers/admin.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { checkAdmin } from "@/middlewares/admin.middleware";

const router: Router = Router();

router.get("/dashboard", authenticate, checkAdmin, getDashboardStats);
router.get("/users", authenticate, checkAdmin, getAllUsers);
router.get("/urls", authenticate, checkAdmin, getAllUrls);
router.put("/users/:userId/role", authenticate, checkAdmin, updateUserRole);

export default router;

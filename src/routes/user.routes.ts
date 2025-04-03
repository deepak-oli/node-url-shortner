import { Router } from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getAllUsers,
} from "@/controllers/user.controller";
import { authenticate } from "@/middlewares/auth.middleware";

const router = Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes - require authentication
router.get("/profile", authenticate as any, getUserProfile);
router.put("/profile", authenticate as any, updateUserProfile);
router.delete("/", authenticate as any, deleteUser);

// Admin routes - would typically require additional admin middleware
router.get("/", authenticate as any, getAllUsers);

export default router;

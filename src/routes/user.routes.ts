import { Router } from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getAllUsers,
  logoutUser,
} from "@/controllers/user.controller";
import { authenticate } from "@/middlewares/auth.middleware";

const router: Router = Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authenticate, logoutUser); // Protected routes - require authentication
router.get("/profile", authenticate, getUserProfile);
router.put("/profile", authenticate, updateUserProfile);
router.delete("/", authenticate, deleteUser);

// Admin routes - would typically require additional admin middleware
router.get("/", authenticate, getAllUsers);

export default router;

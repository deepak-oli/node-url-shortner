import { Router } from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  logoutUser,
} from "@/controllers/user.controller";
import { authenticate } from "@/middlewares/auth.middleware";

const router: Router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authenticate, logoutUser); // Protected routes - require authentication
router.get("/profile", authenticate, getUserProfile);
router.put("/profile", authenticate, updateUserProfile);
router.delete("/", authenticate, deleteUser);

export default router;

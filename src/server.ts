import express from "express";
import type { Express } from "express";
import cookieParser from "cookie-parser";

import { initRedis } from "@/services/redis.service";

import userRoutes from "@/routes/user.routes";
import urlRoutes from "@/routes/url.routes";
import adminRoutes from "@/routes/admin.routes";
import { redirectToUrl } from "@/controllers/url.controller";

const app: Express = express();

app.use(cookieParser());
app.use(express.json());

const router = express.Router();

router.use("/users", userRoutes);
router.use("/urls", urlRoutes);
router.use("/admin", adminRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});
app.get("/:shortCode", redirectToUrl);

app.use("/api/v1", router);

initRedis().catch((err) => {
  console.error("Error initializing Redis:", err);
});

export default app;

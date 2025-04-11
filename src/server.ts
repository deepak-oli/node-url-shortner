import express from "express";
import type { Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { initRedis } from "@/config/redis.config";

import { redirectToUrl } from "@/controllers/url.controller";
import router from "@/routes";

import { ENV } from "@/config/env.config";

const app: Express = express();

const CORS_OPTIONS = {
  origin: ENV.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(CORS_OPTIONS));
app.use(cookieParser());
app.use(express.json());

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

// Shortcode redirect route
app.get("/:shortCode", redirectToUrl);

app.use("/api/v1", router);

// Fallback for unmatched routes
import { CustomResponse } from "@/utils/response.util";

app.use("*", (req, res) => {
  return CustomResponse.error({
    res,
    statusCode: 404,
    message: `Route '${req.originalUrl}' not found.`,
    log: false,
  });
});

initRedis().catch((err) => {
  console.error("Error initializing Redis:", err);
  process.exit(1); // Fail the server startup if Redis isn't initialized
});

export default app;

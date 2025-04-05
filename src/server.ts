import express from "express";
import cookieParser from "cookie-parser";

import { initRedis } from "@/services/redis.service";

import userRoutes from "@/routes/user.routes";
import urlRoutes from "@/routes/url.routes";
import adminRoutes from "@/routes/admin.routes";

const app = express();

app.use(cookieParser());
app.use(express.json());

const router = express.Router();

router.use("/users", userRoutes);
router.use("/urls", urlRoutes);
router.use("/admin", adminRoutes);

app.use("/api/v1", router);

initRedis().catch((err) => {
  console.error("Error initializing Redis:", err);
});

export default app;

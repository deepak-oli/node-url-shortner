import express from "express";
import cookieParser from "cookie-parser";

import userRoutes from "@/routes/user.routes";

const app = express();

app.use(cookieParser());
app.use(express.json());

const router = express.Router();

router.use("/users", userRoutes);
app.use("/api/v1", router);

export default app;

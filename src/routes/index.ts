import { Router } from "express";
import userRoutes from "./user.routes";
import urlRoutes from "./url.routes";
import adminRoutes from "./admin.routes";

const router: Router = Router();

router.use("/users", userRoutes);
router.use("/urls", urlRoutes);
router.use("/admin", adminRoutes);

export default router;

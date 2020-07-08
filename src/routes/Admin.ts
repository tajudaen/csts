import { Router } from "express";
import * as AdminController from "../controllers/AdminController";
import * as AuthController from "../controllers/AuthController";
import { authUser, authAdmin } from "../middlewares/Auth";

const router = Router();

router.post("/invite", authUser, authAdmin, AdminController.newAdmin);
router.post("/login", AuthController.loginAdmin);

export default router;

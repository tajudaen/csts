import { Router } from "express";
import * as AdminController from "../controllers/AdminController";
import * as AuthController from "../controllers/AuthController";
import { authToken, authAdmin, adminAccess } from "../middlewares/Auth";

const router = Router();

router.post("/", authToken, authAdmin, adminAccess, AdminController.newAdmin);
router.post("/login", AuthController.loginAdmin);

export default router;

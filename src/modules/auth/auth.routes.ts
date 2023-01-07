import { Router } from "express";
import * as authController from "./auth.controllers";

const router = Router();

router.route("/login").post(authController.login);
router.route("/register").post(authController.register);

export default router;

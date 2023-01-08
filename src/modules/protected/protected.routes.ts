import { Router } from "express";
import * as protectedController from "./protected.controllers";

const protectedRoutes = Router();

protectedRoutes.route("/get-user-info").get(protectedController.getUserInfo);

export default protectedRoutes;

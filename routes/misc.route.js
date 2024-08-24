import { Router } from "express";
import miscController from "../controllers/misc.controller.js";

const miscRoutes = Router();

miscRoutes.post("/translate", miscController.translate);

export default miscRoutes
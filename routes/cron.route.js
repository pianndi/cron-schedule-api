import { Router } from "express";
import cronController from "../controllers/cron.controller.js";

const cronRoutes = Router();

cronRoutes.get("/", cronController.get);
cronRoutes.post("/", cronController.create);
cronRoutes.delete("/:id", cronController.delete);
cronRoutes.put("/:id", cronController.update);

export default cronRoutes;
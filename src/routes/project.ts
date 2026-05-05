import { Router } from "express";
import requireAuth from "../middlewares/requireAuth";
import requireActive from "../middlewares/requireActive";
import requireUsername from "../middlewares/requireUsername";
import { createProject } from "../controllers/project";

const router = Router();

router.post("", requireAuth, requireActive, requireUsername, createProject )

export { router as projectRouter };
import { Router } from "express";
import requireUsername from "../middlewares/requireUsername";
import createInvite from "../controllers/invite";
import requireActive from "../middlewares/requireActive";
import requireAuth from "../middlewares/requireAuth";

const router = Router();

router.post("/", requireAuth, requireActive, requireUsername, createInvite); // create invite code

export { router as inviteRouter };

import { Router } from "express";
import validateAuth from "../middlewares/validateAuth";
import requireUsername from "../middlewares/requireUsername";
import createInvite from "../controllers/invite";
import requireActive from "../middlewares/requireActive";

const router = Router();

router.post("/", validateAuth, requireActive, requireUsername, createInvite); // create invite code

export { router as inviteRouter };

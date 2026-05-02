import { Router } from "express";
import validateAuth from "../middleware/validateAuth";
import requireUsername from "../middleware/requireUsername";
import createInvite from "../controller/invite";
import requireActive from "../middleware/requireActive";

const router = Router();

router.post("/", validateAuth, requireActive, requireUsername, createInvite); // create invite code

export { router as inviteRouter };

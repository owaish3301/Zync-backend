import { Router } from "express";
import validateAuth from "../middleware/validateAuth";
import requireUsername from "../middleware/requireUsername";
import createInvite from "../controller/invite";

const router = Router();

router.post("/", validateAuth, requireUsername, createInvite); // create invite code

export { router as inviteRouter };

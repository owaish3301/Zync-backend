import { Router } from "express";
import getUser from "../controllers/user";

const router = Router();

router.get("/:username", getUser); // this route returns the user data to show a public profile, this dont need auth

export { router as userRouter };

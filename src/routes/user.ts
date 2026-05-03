import { Router } from "express";
import { activateUser, banUser, deleteUser, getUser } from "../controllers/user";
import checkSuperAdmin from "../middlewares/requireSuperAdmin";
import validateAuth from "../middlewares/requireAuth";
import requireActive from "../middlewares/requireActive";

const router = Router();

router.get("/:username", getUser); // this route returns the user data to show a public profile, this dont need auth
router.get("/:id/approve", validateAuth, requireActive, checkSuperAdmin, activateUser) // superadmin can upgrade a pending user to active
router.get("/:id/ban", validateAuth, requireActive, checkSuperAdmin, banUser) // superadmin can ban a user
router.delete("/:id", validateAuth, requireActive, checkSuperAdmin, deleteUser) // superadmin can delete a user


export { router as userRouter };

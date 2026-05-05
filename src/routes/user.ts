import { Router } from "express";
import { activateUser, banUser, deleteUser, getUser } from "../controllers/user";
import checkSuperAdmin from "../middlewares/requireSuperAdmin";
import requireActive from "../middlewares/requireActive";
import requireAuth from "../middlewares/requireAuth";

const router = Router();

router.patch("/:id/approve", requireAuth, requireActive, checkSuperAdmin, activateUser) // superadmin can upgrade a pending user to active
router.patch("/:id/ban", requireAuth, requireActive, checkSuperAdmin, banUser) // superadmin can ban a user
router.delete("/:id", requireAuth, requireActive, checkSuperAdmin, deleteUser) // superadmin can delete a user
router.get("/:username", getUser); // this route returns the user data to show a public profile, this dont need auth


export { router as userRouter };

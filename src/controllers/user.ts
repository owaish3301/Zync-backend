import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const username = req.params.username;
    if (!username) {
      return res
        .status(400)
        .json({ error: "USERNAME_REQUIRED", message: "Username required" });
    }
    if (typeof username !== "string") {
      return res
        .status(400)
        .json({ error: "INVALID_DATA", message: "Invalid data for username" });
    }
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    return res.status(200).json({
      user: {
        id: user?.id,
        name: user?.name,
        username: user?.username,
        email: user?.email,
        role: user?.role,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "INTERNAL_ERROR", message: "Internal error" });
  }
}

export default getUser;

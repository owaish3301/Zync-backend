// this middleware is dependedent upon validateAuth, use it only after that one
import type { Request, Response, NextFunction } from "express";

function requireUsername(req: Request, res: Response, next: NextFunction) {
  const session = req.session;
  if (!session) {
    return res
      .status(400)
      .json({ error: "MISSING_SESSION", message: "Unauthenticated" });
  }
  const user = session.user;
  if (user.username) {
    return res.status(403).json({
      error: "USERNAME_REQUIRED",
      message: "Please set a username before continuing",
    });
  }
  next();
}

export default requireUsername;


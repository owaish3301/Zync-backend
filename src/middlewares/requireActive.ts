// this middleware is dependedent upton validateAuth, use it after that one
import type { Request, Response, NextFunction } from "express";

function requireActive(req: Request, res: Response, next: NextFunction) {
  const user = req.session!.user;
  if (user.status !== "ACTIVE" || user.deletedAt !== null) {
    return res.status(403).json({
      error: "INACTIVE_USER",
      message: `Your account is ${user.status}`,
    });
  }
  next();
}

export default requireActive;

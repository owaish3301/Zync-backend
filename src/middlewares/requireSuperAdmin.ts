// this middleware is dependedent upon validateAauth middleware, use this middleware only after validateAuth
import type { Request, Response, NextFunction } from "express";

function checkSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const session = req.session;
  if (!session) {
    return res
      .status(400)
      .json({ error: "MISSING_SESSION", message: "Unauthenticated" });
  }
  const user = session.user;
  if (user.role !== "SuperAdmin") {
    return res.status(403).json({ error: "forbidden", message: "Forbidden" });
  }
  next();
}
export default checkSuperAdmin;

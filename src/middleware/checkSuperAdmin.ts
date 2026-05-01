import type { Request, Response, NextFunction } from "express";

function checkSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session!.user.role !== "SuperAdmin") {
    return res.status(403).json({ error: "forbidden", message: "Forbidden" });
  }
  next();
}
export default checkSuperAdmin;


import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

async function validateAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) {
      return res.status(401).json({error:"unauthorized", message: "Unauthorized" });
    }

    req.session = session;

    next();
  } catch (error) {
    return res.status(500).json({ message: "Auth error" });
  }
}

export default validateAuth;

import { auth } from "../lib/auth.js";
import type { Role } from "../lib/generated/prisma/client";

type Session = typeof auth.$Infer.Session

declare global {
  namespace Express {
    interface Request {
      session?: Session;
    }
  }
}
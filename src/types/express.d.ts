declare global {
  namespace Express {
    interface Request {
      session?: import("../lib/auth.js").auth.$Infer.Session;
    }
  }
}

export {};


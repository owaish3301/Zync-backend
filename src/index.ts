import express, { type Response } from "express";
import { PORT } from "./config/env.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import cors from "cors";
import { inviteRouter } from "./routes/invite.js";
import { userRouter } from "./routes/user.js";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true
  }),
);

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());

app.get("/api/health", (_req, res: Response) => {
  res.status(200).json({ message: "All good!" });
});

app.use("/api/invites", inviteRouter);
app.use("/api/users", userRouter);

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});

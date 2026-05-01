import express from "express";
import { PORT } from "./config/env.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

const app = express();

app.use("/api/auth/**", toNodeHandler(auth));

app.use(express.json());

app.get("/api/health", (req, res, next) => {
  res.status(200).json({ message: "All good!" });
});

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});

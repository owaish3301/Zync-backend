import express from "express";
import { PORT } from "./config/env.js";

const app = express();

app.get("/api/health", (req, res, next) => {
  res.status(200).json({ message: "All good!" });
});

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});

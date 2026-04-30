import express from "express";
import { PORT } from "./config/env.js";

const app = express();

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});

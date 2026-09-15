require("dotenv").config();
const express = require("express");
const cors = require("cors");

const questionsRouter = require("./routes/questions");
const attemptsRouter = require("./routes/attempts");
const { PROVIDER } = require("./ai");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok", aiProvider: PROVIDER }));

app.use("/api/questions", questionsRouter);
app.use("/api/attempts", attemptsRouter);

app.listen(PORT, () => {
  console.log(`Smart Question Generator API running on http://localhost:${PORT}`);
});

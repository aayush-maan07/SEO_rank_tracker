import dns from 'dns'
dns.setServers(["8.8.8.8"])


import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import rankRouter from "./routes/rankRoutes.js";
import analysisRouter from "./routes/analysisRoutes.js";
import { startRankTrackingCron } from "./cron/rankTrackingCron.js";

import KeywordTracking from "./models/keywordTracking.js";

connectDB().then(async () => {
    // Reset any keywords stuck in "checking" from a previous server crash
    const stale = await KeywordTracking.updateMany({ status: "checking" }, { $set: { status: "failed" } });
    if (stale.modifiedCount > 0) console.log(`Reset ${stale.modifiedCount} stale "checking" keyword(s) to "failed"`);
});

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Server is running"));
app.use("/api/auth", authRouter);
app.use("/api/rank", rankRouter);
app.use("/api/analysis", analysisRouter);

// Start cron jobs
startRankTrackingCron();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

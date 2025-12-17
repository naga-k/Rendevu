import "dotenv/config";
import express from "express";
import { webhookRouter, aiRouter } from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use("/webhook", webhookRouter);
app.use("/ai", aiRouter);

// Root health check
app.get("/", (_req, res) => {
  res.json({
    name: "cal.com AI Connector",
    version: "1.0.0",
    endpoints: {
      webhook: "/webhook/calcom",
      ai: {
        summary: "POST /ai/summary",
        scheduling: "POST /ai/scheduling",
        email: "POST /ai/email",
        brief: "POST /ai/brief",
        health: "GET /ai/health",
      },
    },
  });
});

app.listen(PORT, () => {
  console.log(`Cal.com AI Connector running on port ${PORT}`);
  console.log(`AI Provider: ${process.env.AI_PROVIDER || "anthropic"}`);
});

export default app;

import { Router, Request, Response } from "express";
import { CalcomWebhookHandler } from "../services/calcom-webhook.js";
import { getDefaultProvider } from "../services/index.js";
import type { CalcomWebhookPayload } from "../types/index.js";

const router = Router();
const aiProvider = getDefaultProvider();
const webhookHandler = new CalcomWebhookHandler(aiProvider);

router.post("/calcom", async (req: Request, res: Response) => {
  try {
    const payload = req.body as CalcomWebhookPayload;

    if (!payload.triggerEvent || !payload.payload) {
      res.status(400).json({ error: "Invalid webhook payload" });
      return;
    }

    console.log(`Received cal.com webhook: ${payload.triggerEvent}`);
    const result = await webhookHandler.handleWebhook(payload);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

export default router;

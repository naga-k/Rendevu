import { Router, Request, Response } from "express";
import { getDefaultProvider } from "../services/index.js";
import type {
  MeetingSummaryRequest,
  SchedulingSuggestionRequest,
  EmailGenerationRequest,
  MeetingBriefRequest,
} from "../types/index.js";

const router = Router();
const aiProvider = getDefaultProvider();

router.post("/summary", async (req: Request, res: Response) => {
  try {
    const request = req.body as MeetingSummaryRequest;

    if (!request.title || !request.organizer || !request.attendees || !request.duration) {
      res.status(400).json({ error: "Missing required fields: title, organizer, attendees, duration" });
      return;
    }

    const result = await aiProvider.generateMeetingSummary(request);
    res.json(result);
  } catch (error) {
    console.error("Summary generation error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

router.post("/scheduling", async (req: Request, res: Response) => {
  try {
    const request = req.body as SchedulingSuggestionRequest;

    if (!request.userMessage) {
      res.status(400).json({ error: "Missing required field: userMessage" });
      return;
    }

    const result = await aiProvider.generateSchedulingSuggestion(request);
    res.json(result);
  } catch (error) {
    console.error("Scheduling suggestion error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

router.post("/email", async (req: Request, res: Response) => {
  try {
    const request = req.body as EmailGenerationRequest;

    if (!request.type || !request.booking || !request.recipientName) {
      res.status(400).json({ error: "Missing required fields: type, booking, recipientName" });
      return;
    }

    const result = await aiProvider.generateEmail(request);
    res.json(result);
  } catch (error) {
    console.error("Email generation error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

router.post("/brief", async (req: Request, res: Response) => {
  try {
    const request = req.body as MeetingBriefRequest;

    if (!request.title || !request.attendees) {
      res.status(400).json({ error: "Missing required fields: title, attendees" });
      return;
    }

    const result = await aiProvider.generateMeetingBrief(request);
    res.json(result);
  } catch (error) {
    console.error("Meeting brief error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    provider: aiProvider.name,
    timestamp: new Date().toISOString(),
  });
});

export default router;

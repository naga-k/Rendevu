import OpenAI from "openai";
import type { AIProvider } from "./ai-provider.js";
import type {
  MeetingSummaryRequest,
  MeetingSummaryResponse,
  SchedulingSuggestionRequest,
  SchedulingSuggestionResponse,
  EmailGenerationRequest,
  EmailGenerationResponse,
  MeetingBriefRequest,
  MeetingBriefResponse,
} from "../types/index.js";

export class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  private client: OpenAI;
  private model: string;

  constructor(apiKey?: string, model: string = "gpt-4o") {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
    this.model = model;
  }

  private async chat(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }
    return content;
  }

  async generateMeetingSummary(
    request: MeetingSummaryRequest
  ): Promise<MeetingSummaryResponse> {
    const systemPrompt = `You are a professional meeting assistant. Analyze meetings and provide clear, actionable summaries. Always respond with valid JSON.`;

    const userPrompt = `Analyze this meeting and provide a structured summary:

Meeting Title: ${request.title}
Description: ${request.description || "No description provided"}
Organizer: ${request.organizer}
Attendees: ${request.attendees.join(", ")}
Duration: ${request.duration} minutes
${request.notes ? `Notes: ${request.notes}` : ""}
${request.transcript ? `Transcript: ${request.transcript}` : ""}

Respond with JSON in this format:
{
  "summary": "A concise 2-3 sentence summary of the meeting",
  "keyPoints": ["Key point 1", "Key point 2"],
  "actionItems": ["Action item 1", "Action item 2"],
  "nextSteps": ["Next step 1", "Next step 2"]
}`;

    const response = await this.chat(systemPrompt, userPrompt);
    return JSON.parse(response) as MeetingSummaryResponse;
  }

  async generateSchedulingSuggestion(
    request: SchedulingSuggestionRequest
  ): Promise<SchedulingSuggestionResponse> {
    const systemPrompt = `You are a smart scheduling assistant. Help users find optimal meeting times and interpret natural language scheduling requests. Always respond with valid JSON.`;

    const userPrompt = `Help with scheduling based on this request:

User Message: "${request.userMessage}"
${request.availableSlots ? `Available Slots: ${JSON.stringify(request.availableSlots)}` : ""}
${request.preferences ? `Preferences: ${JSON.stringify(request.preferences)}` : ""}

Respond with JSON in this format:
{
  "suggestion": "Your scheduling suggestion/response",
  "recommendedSlots": [{"start": "ISO datetime", "end": "ISO datetime"}],
  "reasoning": "Brief explanation of why these times are recommended"
}`;

    const response = await this.chat(systemPrompt, userPrompt);
    return JSON.parse(response) as SchedulingSuggestionResponse;
  }

  async generateEmail(
    request: EmailGenerationRequest
  ): Promise<EmailGenerationResponse> {
    const typeDescriptions: Record<EmailGenerationRequest["type"], string> = {
      confirmation: "booking confirmation email",
      reminder: "meeting reminder email",
      cancellation: "meeting cancellation email",
      reschedule: "meeting reschedule notification email",
      followup: "post-meeting follow-up email",
    };

    const systemPrompt = `You are a professional email writer. Create clear, friendly, and professional emails for scheduling-related communications. Always respond with valid JSON.`;

    const userPrompt = `Generate a professional ${typeDescriptions[request.type]}:

Meeting Details:
- Title: ${request.booking.title}
- Start: ${request.booking.startTime}
- End: ${request.booking.endTime}
- Organizer: ${request.booking.organizer}
- Attendees: ${request.booking.attendees.join(", ")}
${request.booking.location ? `- Location: ${request.booking.location}` : ""}

Recipient: ${request.recipientName}
${request.additionalContext ? `Additional Context: ${request.additionalContext}` : ""}

Respond with JSON in this format:
{
  "subject": "Email subject line",
  "body": "Full email body (use \\n for line breaks)"
}`;

    const response = await this.chat(systemPrompt, userPrompt);
    return JSON.parse(response) as EmailGenerationResponse;
  }

  async generateMeetingBrief(
    request: MeetingBriefRequest
  ): Promise<MeetingBriefResponse> {
    const systemPrompt = `You are a professional meeting preparation assistant. Help users prepare for meetings by providing comprehensive briefs. Always respond with valid JSON.`;

    const userPrompt = `Generate a pre-meeting brief:

Upcoming Meeting: ${request.title}
Description: ${request.description || "No description"}
Attendees: ${request.attendees.map((a) => `${a.name} (${a.email})`).join(", ")}
${
  request.previousMeetings?.length
    ? `Previous Meetings with these attendees:
${request.previousMeetings.map((m) => `- ${m.title} (${m.date}): ${m.summary || "No summary"}`).join("\n")}`
    : ""
}

Respond with JSON in this format:
{
  "brief": "A 2-3 paragraph overview to prepare for this meeting",
  "suggestedAgenda": ["Agenda item 1", "Agenda item 2"],
  "talkingPoints": ["Talking point 1", "Talking point 2"],
  "questionsToConsider": ["Question 1", "Question 2"]
}`;

    const response = await this.chat(systemPrompt, userPrompt);
    return JSON.parse(response) as MeetingBriefResponse;
  }
}

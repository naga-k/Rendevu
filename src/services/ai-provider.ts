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

export interface AIProvider {
  readonly name: string;

  generateMeetingSummary(
    request: MeetingSummaryRequest
  ): Promise<MeetingSummaryResponse>;

  generateSchedulingSuggestion(
    request: SchedulingSuggestionRequest
  ): Promise<SchedulingSuggestionResponse>;

  generateEmail(
    request: EmailGenerationRequest
  ): Promise<EmailGenerationResponse>;

  generateMeetingBrief(
    request: MeetingBriefRequest
  ): Promise<MeetingBriefResponse>;
}

export type AIProviderType = "anthropic" | "openai";

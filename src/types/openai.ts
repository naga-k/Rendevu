export interface MeetingSummaryRequest {
  title: string;
  description: string | null;
  attendees: string[];
  organizer: string;
  duration: number;
  notes?: string;
  transcript?: string;
}

export interface MeetingSummaryResponse {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  nextSteps?: string[];
}

export interface SchedulingSuggestionRequest {
  userMessage: string;
  availableSlots?: TimeSlot[];
  preferences?: SchedulingPreferences;
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface SchedulingPreferences {
  preferredTimes?: string[];
  avoidTimes?: string[];
  duration?: number;
  timezone?: string;
}

export interface SchedulingSuggestionResponse {
  suggestion: string;
  recommendedSlots?: TimeSlot[];
  reasoning?: string;
}

export interface EmailGenerationRequest {
  type: "confirmation" | "reminder" | "cancellation" | "reschedule" | "followup";
  booking: {
    title: string;
    startTime: string;
    endTime: string;
    attendees: string[];
    organizer: string;
    location?: string;
  };
  recipientName: string;
  additionalContext?: string;
}

export interface EmailGenerationResponse {
  subject: string;
  body: string;
}

export interface MeetingBriefRequest {
  title: string;
  description: string | null;
  attendees: Array<{
    name: string;
    email: string;
  }>;
  previousMeetings?: Array<{
    title: string;
    date: string;
    summary?: string;
  }>;
}

export interface MeetingBriefResponse {
  brief: string;
  suggestedAgenda: string[];
  talkingPoints: string[];
  questionsToConsider: string[];
}

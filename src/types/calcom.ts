export interface CalcomWebhookPayload {
  triggerEvent: CalcomEventType;
  createdAt: string;
  payload: BookingPayload;
}

export type CalcomEventType =
  | "BOOKING_CREATED"
  | "BOOKING_RESCHEDULED"
  | "BOOKING_CANCELLED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_REJECTED"
  | "BOOKING_REQUESTED"
  | "BOOKING_PAYMENT_INITIATED"
  | "BOOKING_PAYMENT_COMPLETE"
  | "MEETING_ENDED"
  | "MEETING_STARTED"
  | "RECORDING_READY";

export interface BookingPayload {
  id: number;
  uid: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  status: string;
  location: string | null;
  eventTypeId: number;
  organizer: Attendee;
  attendees: Attendee[];
  metadata: Record<string, unknown>;
  responses?: Record<string, string>;
  additionalNotes?: string;
}

export interface Attendee {
  id?: number;
  email: string;
  name: string;
  timeZone: string;
  language?: string;
}

export interface MeetingRecording {
  downloadUrl: string;
  duration: number;
  format: string;
}

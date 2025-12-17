import type { AIProvider } from "./ai-provider.js";
import type {
  CalcomWebhookPayload,
  CalcomEventType,
  BookingPayload,
  MeetingSummaryResponse,
  EmailGenerationResponse,
  MeetingBriefResponse,
} from "../types/index.js";

export interface WebhookHandlerResult {
  success: boolean;
  event: CalcomEventType;
  data?: unknown;
  error?: string;
}

export class CalcomWebhookHandler {
  private aiProvider: AIProvider;
  private handlers: Map<CalcomEventType, (payload: BookingPayload) => Promise<unknown>>;

  constructor(aiProvider: AIProvider) {
    this.aiProvider = aiProvider;
    this.handlers = new Map();
    this.registerDefaultHandlers();
  }

  private registerDefaultHandlers(): void {
    this.handlers.set("BOOKING_CREATED", this.handleBookingCreated.bind(this));
    this.handlers.set("BOOKING_CONFIRMED", this.handleBookingConfirmed.bind(this));
    this.handlers.set("BOOKING_CANCELLED", this.handleBookingCancelled.bind(this));
    this.handlers.set("BOOKING_RESCHEDULED", this.handleBookingRescheduled.bind(this));
    this.handlers.set("MEETING_ENDED", this.handleMeetingEnded.bind(this));
  }

  async handleWebhook(payload: CalcomWebhookPayload): Promise<WebhookHandlerResult> {
    const handler = this.handlers.get(payload.triggerEvent);

    if (!handler) {
      return {
        success: true,
        event: payload.triggerEvent,
        data: { message: `No handler registered for event: ${payload.triggerEvent}` },
      };
    }

    try {
      const data = await handler(payload.payload);
      return {
        success: true,
        event: payload.triggerEvent,
        data,
      };
    } catch (error) {
      return {
        success: false,
        event: payload.triggerEvent,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async handleBookingCreated(
    booking: BookingPayload
  ): Promise<{ brief: MeetingBriefResponse; email: EmailGenerationResponse }> {
    const [brief, email] = await Promise.all([
      this.aiProvider.generateMeetingBrief({
        title: booking.title,
        description: booking.description,
        attendees: booking.attendees.map((a) => ({ name: a.name, email: a.email })),
      }),
      this.aiProvider.generateEmail({
        type: "confirmation",
        booking: {
          title: booking.title,
          startTime: booking.startTime,
          endTime: booking.endTime,
          attendees: booking.attendees.map((a) => a.email),
          organizer: booking.organizer.name,
          location: booking.location || undefined,
        },
        recipientName: booking.attendees[0]?.name || "Attendee",
      }),
    ]);

    return { brief, email };
  }

  private async handleBookingConfirmed(
    booking: BookingPayload
  ): Promise<{ email: EmailGenerationResponse }> {
    const email = await this.aiProvider.generateEmail({
      type: "confirmation",
      booking: {
        title: booking.title,
        startTime: booking.startTime,
        endTime: booking.endTime,
        attendees: booking.attendees.map((a) => a.email),
        organizer: booking.organizer.name,
        location: booking.location || undefined,
      },
      recipientName: booking.attendees[0]?.name || "Attendee",
      additionalContext: "This booking has been confirmed.",
    });

    return { email };
  }

  private async handleBookingCancelled(
    booking: BookingPayload
  ): Promise<{ email: EmailGenerationResponse }> {
    const email = await this.aiProvider.generateEmail({
      type: "cancellation",
      booking: {
        title: booking.title,
        startTime: booking.startTime,
        endTime: booking.endTime,
        attendees: booking.attendees.map((a) => a.email),
        organizer: booking.organizer.name,
        location: booking.location || undefined,
      },
      recipientName: booking.attendees[0]?.name || "Attendee",
    });

    return { email };
  }

  private async handleBookingRescheduled(
    booking: BookingPayload
  ): Promise<{ email: EmailGenerationResponse }> {
    const email = await this.aiProvider.generateEmail({
      type: "reschedule",
      booking: {
        title: booking.title,
        startTime: booking.startTime,
        endTime: booking.endTime,
        attendees: booking.attendees.map((a) => a.email),
        organizer: booking.organizer.name,
        location: booking.location || undefined,
      },
      recipientName: booking.attendees[0]?.name || "Attendee",
    });

    return { email };
  }

  private async handleMeetingEnded(
    booking: BookingPayload
  ): Promise<{ summary: MeetingSummaryResponse; followupEmail: EmailGenerationResponse }> {
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    const [summary, followupEmail] = await Promise.all([
      this.aiProvider.generateMeetingSummary({
        title: booking.title,
        description: booking.description,
        organizer: booking.organizer.name,
        attendees: booking.attendees.map((a) => a.name),
        duration: durationMinutes,
        notes: booking.additionalNotes,
      }),
      this.aiProvider.generateEmail({
        type: "followup",
        booking: {
          title: booking.title,
          startTime: booking.startTime,
          endTime: booking.endTime,
          attendees: booking.attendees.map((a) => a.email),
          organizer: booking.organizer.name,
          location: booking.location || undefined,
        },
        recipientName: booking.attendees[0]?.name || "Attendee",
      }),
    ]);

    return { summary, followupEmail };
  }

  registerHandler(
    event: CalcomEventType,
    handler: (payload: BookingPayload) => Promise<unknown>
  ): void {
    this.handlers.set(event, handler);
  }
}

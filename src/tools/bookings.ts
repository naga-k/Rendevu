/**
 * MCP Tools for Cal.com Booking Management
 */

import { z } from 'zod';
import type { CalcomClient } from '../calcom-client.js';

const ListBookingsSchema = z.object({
  status: z.string().optional(),
  eventTypeId: z.number().int().positive().optional(),
  attendeeEmail: z.string().email().optional(),
});

const GetBookingSchema = z.object({
  bookingUid: z.string().min(1),
});

const CancelBookingSchema = z.object({
  bookingUid: z.string().min(1),
  cancellationReason: z.string().optional(),
});

const RescheduleBookingSchema = z.object({
  bookingUid: z.string().min(1),
  start: z.string().min(1),
  reschedulingReason: z.string().optional(),
});

export const bookingTools = [
  {
    name: 'list_bookings',
    description: 'Get all bookings. Can filter by status (upcoming, past, cancelled), event type ID, or attendee email.',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by status: upcoming, past, cancelled, unconfirmed' },
        eventTypeId: { type: 'number', description: 'Filter by event type ID' },
        attendeeEmail: { type: 'string', description: 'Filter by attendee email' },
      },
      required: [],
    },
  },
  {
    name: 'get_booking',
    description: 'Get detailed information about a specific booking by its UID.',
    inputSchema: {
      type: 'object',
      properties: {
        bookingUid: { type: 'string', description: 'The unique identifier of the booking' },
      },
      required: ['bookingUid'],
    },
  },
  {
    name: 'cancel_booking',
    description: 'Cancel a booking by its UID. Optionally provide a cancellation reason.',
    inputSchema: {
      type: 'object',
      properties: {
        bookingUid: { type: 'string', description: 'The unique identifier of the booking to cancel' },
        cancellationReason: { type: 'string', description: 'Reason for cancellation' },
      },
      required: ['bookingUid'],
    },
  },
  {
    name: 'reschedule_booking',
    description: 'Reschedule a booking to a new time. Provide the new start time in ISO 8601 format.',
    inputSchema: {
      type: 'object',
      properties: {
        bookingUid: { type: 'string', description: 'The unique identifier of the booking' },
        start: { type: 'string', description: 'New start time in ISO 8601 format (e.g., 2025-01-15T10:00:00Z)' },
        reschedulingReason: { type: 'string', description: 'Reason for rescheduling' },
      },
      required: ['bookingUid', 'start'],
    },
  },
];

export class BookingToolHandlers {
  private client: CalcomClient;

  constructor(client: CalcomClient) {
    this.client = client;
  }

  async listBookings(args: unknown) {
    const parsed = ListBookingsSchema.parse(args);
    const result = await this.client.listBookings(parsed);

    if (result.status === 'error') {
      return { content: [{ type: 'text', text: `Error: ${result.error?.message}` }], isError: true };
    }
    return { content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }] };
  }

  async getBooking(args: unknown) {
    const parsed = GetBookingSchema.parse(args);
    const result = await this.client.getBooking(parsed.bookingUid);

    if (result.status === 'error') {
      return { content: [{ type: 'text', text: `Error: ${result.error?.message}` }], isError: true };
    }
    return { content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }] };
  }

  async cancelBooking(args: unknown) {
    const parsed = CancelBookingSchema.parse(args);
    const result = await this.client.cancelBooking(parsed.bookingUid, {
      cancellationReason: parsed.cancellationReason,
    });

    if (result.status === 'error') {
      return { content: [{ type: 'text', text: `Error: ${result.error?.message}` }], isError: true };
    }
    return { content: [{ type: 'text', text: `Booking ${parsed.bookingUid} cancelled successfully` }] };
  }

  async rescheduleBooking(args: unknown) {
    const parsed = RescheduleBookingSchema.parse(args);
    const result = await this.client.rescheduleBooking(parsed.bookingUid, {
      start: parsed.start,
      reschedulingReason: parsed.reschedulingReason,
    });

    if (result.status === 'error') {
      return { content: [{ type: 'text', text: `Error: ${result.error?.message}` }], isError: true };
    }
    return { content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }] };
  }
}

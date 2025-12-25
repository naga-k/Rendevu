/**
 * MCP Tools for Cal.com Availability Slots
 */

import { z } from 'zod';
import type { CalcomClient } from '../calcom-client.js';

const GetAvailableSlotsSchema = z.object({
  eventTypeId: z.number().int().positive().optional(),
  eventTypeSlug: z.string().optional(),
  username: z.string().optional(),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  timeZone: z.string().optional(),
});

export const slotTools = [
  {
    name: 'get_available_slots',
    description: 'Get available time slots for booking. Specify an event type (by ID or slug+username) and a date range. Returns slots grouped by date.',
    inputSchema: {
      type: 'object',
      properties: {
        eventTypeId: { type: 'number', description: 'Event type ID to check availability for' },
        eventTypeSlug: { type: 'string', description: 'Event type slug (requires username)' },
        username: { type: 'string', description: 'Username (required if using eventTypeSlug)' },
        startTime: { type: 'string', description: 'Start of date range in ISO 8601 format' },
        endTime: { type: 'string', description: 'End of date range in ISO 8601 format' },
        timeZone: { type: 'string', description: 'Timezone for slots (e.g., America/New_York)' },
      },
      required: ['startTime', 'endTime'],
    },
  },
];

export class SlotToolHandlers {
  private client: CalcomClient;

  constructor(client: CalcomClient) {
    this.client = client;
  }

  async getAvailableSlots(args: unknown) {
    const parsed = GetAvailableSlotsSchema.parse(args);
    const result = await this.client.getAvailableSlots(parsed);

    if (result.status === 'error') {
      return { content: [{ type: 'text', text: `Error: ${result.error?.message}` }], isError: true };
    }
    return { content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }] };
  }
}

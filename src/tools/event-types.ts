/**
 * MCP Tools for Cal.com Event Type Management
 */

import { z } from 'zod';
import type { CalcomClient } from '../calcom-client.js';

// Zod schemas for input validation
const LocationSchema = z.object({
  type: z.string(),
  link: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

const ListEventTypesSchema = z.object({});

const GetEventTypeSchema = z.object({
  eventTypeId: z.number().int().positive(),
});

const CreateEventTypeSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  lengthInMinutes: z.number().int().positive(),
  description: z.string().optional(),
  locations: z.array(LocationSchema).optional(),
  scheduleId: z.number().int().positive().optional(),
  hidden: z.boolean().optional(),
  requiresConfirmation: z.boolean().optional(),
  disableGuests: z.boolean().optional(),
  minimumBookingNotice: z.number().int().min(0).optional(),
  beforeEventBuffer: z.number().int().min(0).optional(),
  afterEventBuffer: z.number().int().min(0).optional(),
  slotInterval: z.number().int().positive().optional(),
});

const UpdateEventTypeSchema = z.object({
  eventTypeId: z.number().int().positive(),
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  lengthInMinutes: z.number().int().positive().optional(),
  description: z.string().optional(),
  locations: z.array(LocationSchema).optional(),
  scheduleId: z.number().int().positive().optional(),
  hidden: z.boolean().optional(),
  requiresConfirmation: z.boolean().optional(),
  disableGuests: z.boolean().optional(),
  minimumBookingNotice: z.number().int().min(0).optional(),
  beforeEventBuffer: z.number().int().min(0).optional(),
  afterEventBuffer: z.number().int().min(0).optional(),
  slotInterval: z.number().int().positive().optional(),
});

const DeleteEventTypeSchema = z.object({
  eventTypeId: z.number().int().positive(),
});

// Tool definitions for MCP
export const eventTypeTools = [
  {
    name: 'list_event_types',
    description: 'Get all event types for the authenticated user. Returns a list of event types with their IDs, titles, slugs, durations, and settings.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_event_type',
    description: 'Get detailed information about a specific event type by ID. Returns full event type details including locations, buffers, and scheduling settings.',
    inputSchema: {
      type: 'object',
      properties: {
        eventTypeId: {
          type: 'number',
          description: 'The ID of the event type to retrieve',
        },
      },
      required: ['eventTypeId'],
    },
  },
  {
    name: 'create_event_type',
    description: 'Create a new event type. Requires title, slug, and duration. Can optionally set locations, schedule, visibility, and buffer times.',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Display name for the event type (e.g., "30 Minute Meeting")',
        },
        slug: {
          type: 'string',
          description: 'URL-friendly identifier (e.g., "30min")',
        },
        lengthInMinutes: {
          type: 'number',
          description: 'Duration of the event in minutes',
        },
        description: {
          type: 'string',
          description: 'Description shown on the booking page',
        },
        locations: {
          type: 'array',
          description: 'Meeting locations (e.g., Zoom, Google Meet, in-person)',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              link: { type: 'string' },
              address: { type: 'string' },
              phone: { type: 'string' },
            },
          },
        },
        scheduleId: {
          type: 'number',
          description: 'ID of the schedule to use for availability',
        },
        hidden: {
          type: 'boolean',
          description: 'Whether to hide this event type from the public page',
        },
        requiresConfirmation: {
          type: 'boolean',
          description: 'Whether bookings require manual confirmation',
        },
        disableGuests: {
          type: 'boolean',
          description: 'Whether to prevent attendees from adding guests',
        },
        minimumBookingNotice: {
          type: 'number',
          description: 'Minimum notice required before booking (in minutes)',
        },
        beforeEventBuffer: {
          type: 'number',
          description: 'Buffer time before the event (in minutes)',
        },
        afterEventBuffer: {
          type: 'number',
          description: 'Buffer time after the event (in minutes)',
        },
        slotInterval: {
          type: 'number',
          description: 'Interval between available slots (in minutes)',
        },
      },
      required: ['title', 'slug', 'lengthInMinutes'],
    },
  },
  {
    name: 'update_event_type',
    description: 'Update an existing event type. Can modify title, duration, locations, visibility, and other settings.',
    inputSchema: {
      type: 'object',
      properties: {
        eventTypeId: {
          type: 'number',
          description: 'The ID of the event type to update',
        },
        title: {
          type: 'string',
          description: 'New display name',
        },
        slug: {
          type: 'string',
          description: 'New URL slug',
        },
        lengthInMinutes: {
          type: 'number',
          description: 'New duration in minutes',
        },
        description: {
          type: 'string',
          description: 'New description',
        },
        hidden: {
          type: 'boolean',
          description: 'Whether to hide from public page',
        },
        requiresConfirmation: {
          type: 'boolean',
          description: 'Whether bookings require confirmation',
        },
      },
      required: ['eventTypeId'],
    },
  },
  {
    name: 'delete_event_type',
    description: 'Delete an event type by ID. This action is irreversible.',
    inputSchema: {
      type: 'object',
      properties: {
        eventTypeId: {
          type: 'number',
          description: 'The ID of the event type to delete',
        },
      },
      required: ['eventTypeId'],
    },
  },
];

/**
 * Handler class for event type tools
 */
export class EventTypeToolHandlers {
  private client: CalcomClient;

  constructor(client: CalcomClient) {
    this.client = client;
  }

  async listEventTypes(_args: unknown) {
    ListEventTypesSchema.parse(_args);
    const result = await this.client.listEventTypes();

    if (result.status === 'error') {
      return {
        content: [{ type: 'text', text: `Error: ${result.error?.message}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }],
    };
  }

  async getEventType(args: unknown) {
    const parsed = GetEventTypeSchema.parse(args);
    const result = await this.client.getEventType(parsed.eventTypeId);

    if (result.status === 'error') {
      return {
        content: [{ type: 'text', text: `Error: ${result.error?.message}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }],
    };
  }

  async createEventType(args: unknown) {
    const parsed = CreateEventTypeSchema.parse(args);
    const result = await this.client.createEventType(parsed);

    if (result.status === 'error') {
      return {
        content: [{ type: 'text', text: `Error: ${result.error?.message}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }],
    };
  }

  async updateEventType(args: unknown) {
    const parsed = UpdateEventTypeSchema.parse(args);
    const { eventTypeId, ...updateData } = parsed;
    const result = await this.client.updateEventType(eventTypeId, updateData);

    if (result.status === 'error') {
      return {
        content: [{ type: 'text', text: `Error: ${result.error?.message}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }],
    };
  }

  async deleteEventType(args: unknown) {
    const parsed = DeleteEventTypeSchema.parse(args);
    const result = await this.client.deleteEventType(parsed.eventTypeId);

    if (result.status === 'error') {
      return {
        content: [{ type: 'text', text: `Error: ${result.error?.message}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: 'text', text: `Event type ${parsed.eventTypeId} deleted successfully` }],
    };
  }
}

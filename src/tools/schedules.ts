/**
 * MCP Tools for Cal.com Schedule Management
 */

import { z } from 'zod';
import type { CalcomClient } from '../calcom-client.js';

// Day of week enum for validation
const DayOfWeekEnum = z.enum([
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]);

// Zod schemas for input validation
const AvailabilityBlockSchema = z.object({
  days: z.array(DayOfWeekEnum),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Must be in HH:MM format'),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Must be in HH:MM format'),
});

const ScheduleOverrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format'),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Must be in HH:MM format'),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Must be in HH:MM format'),
});

const ListSchedulesSchema = z.object({});

const GetScheduleSchema = z.object({
  scheduleId: z.number().int().positive(),
});

const CreateScheduleSchema = z.object({
  name: z.string().min(1),
  timeZone: z.string().min(1),
  isDefault: z.boolean(),
  availability: z.array(AvailabilityBlockSchema).optional(),
  overrides: z.array(ScheduleOverrideSchema).optional(),
});

const UpdateScheduleSchema = z.object({
  scheduleId: z.number().int().positive(),
  name: z.string().min(1).optional(),
  timeZone: z.string().min(1).optional(),
  isDefault: z.boolean().optional(),
  availability: z.array(AvailabilityBlockSchema).optional(),
  overrides: z.array(ScheduleOverrideSchema).optional(),
});

const DeleteScheduleSchema = z.object({
  scheduleId: z.number().int().positive(),
});

/**
 * Tool definitions for MCP server
 */
export const scheduleTools = [
  {
    name: 'list_schedules',
    description: 'Get all schedules for the authenticated user. Returns a list of all schedules with their IDs, names, timezones, and default status.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_schedule',
    description: 'Get details of a specific schedule by ID. Returns full schedule information including availability blocks and overrides.',
    inputSchema: {
      type: 'object',
      properties: {
        scheduleId: {
          type: 'number',
          description: 'The ID of the schedule to retrieve',
        },
      },
      required: ['scheduleId'],
    },
  },
  {
    name: 'create_schedule',
    description: 'Create a new schedule with availability blocks. Each user should have one default schedule. Days are specified as day names (e.g., "Monday", "Tuesday"). Times are in HH:MM format (24-hour). If no availability is provided, defaults to Monday-Friday 09:00-17:00.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the schedule',
        },
        timeZone: {
          type: 'string',
          description: 'Timezone for the schedule (e.g., "America/New_York", "Europe/London")',
        },
        isDefault: {
          type: 'boolean',
          description: 'Whether this is the default schedule for the user',
        },
        availability: {
          type: 'array',
          description: 'Array of availability blocks defining when the user is available',
          items: {
            type: 'object',
            properties: {
              days: {
                type: 'array',
                items: { type: 'string' },
                description: 'Days of the week (e.g., ["Monday", "Tuesday", "Wednesday"])',
              },
              startTime: {
                type: 'string',
                description: 'Start time in HH:MM format (24-hour)',
              },
              endTime: {
                type: 'string',
                description: 'End time in HH:MM format (24-hour)',
              },
            },
            required: ['days', 'startTime', 'endTime'],
          },
        },
        overrides: {
          type: 'array',
          description: 'Date-specific availability overrides',
          items: {
            type: 'object',
            properties: {
              date: {
                type: 'string',
                description: 'Date in YYYY-MM-DD format',
              },
              startTime: {
                type: 'string',
                description: 'Start time in HH:MM format (24-hour)',
              },
              endTime: {
                type: 'string',
                description: 'End time in HH:MM format (24-hour)',
              },
            },
            required: ['date', 'startTime', 'endTime'],
          },
        },
      },
      required: ['name', 'timeZone', 'isDefault'],
    },
  },
  {
    name: 'update_schedule',
    description: 'Update an existing schedule. You can update the name, timezone, default status, availability blocks, or overrides. All fields except scheduleId are optional.',
    inputSchema: {
      type: 'object',
      properties: {
        scheduleId: {
          type: 'number',
          description: 'The ID of the schedule to update',
        },
        name: {
          type: 'string',
          description: 'New name for the schedule',
        },
        timeZone: {
          type: 'string',
          description: 'New timezone for the schedule',
        },
        isDefault: {
          type: 'boolean',
          description: 'Whether this should be the default schedule',
        },
        availability: {
          type: 'array',
          description: 'New availability blocks (replaces existing)',
          items: {
            type: 'object',
            properties: {
              days: {
                type: 'array',
                items: { type: 'string' },
              },
              startTime: { type: 'string' },
              endTime: { type: 'string' },
            },
            required: ['days', 'startTime', 'endTime'],
          },
        },
        overrides: {
          type: 'array',
          description: 'New overrides (replaces existing)',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string' },
              startTime: { type: 'string' },
              endTime: { type: 'string' },
            },
            required: ['date', 'startTime', 'endTime'],
          },
        },
      },
      required: ['scheduleId'],
    },
  },
  {
    name: 'delete_schedule',
    description: 'Delete a schedule by ID. Cannot delete the default schedule if it is the only schedule.',
    inputSchema: {
      type: 'object',
      properties: {
        scheduleId: {
          type: 'number',
          description: 'The ID of the schedule to delete',
        },
      },
      required: ['scheduleId'],
    },
  },
];

/**
 * Tool handlers
 */
export class ScheduleToolHandlers {
  constructor(private client: CalcomClient) {}

  async listSchedules(args: unknown) {
    const parsed = ListSchedulesSchema.parse(args);
    const response = await this.client.listSchedules();

    if (response.status === 'error') {
      throw new Error(response.error?.message || 'Failed to list schedules');
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  async getSchedule(args: unknown) {
    const parsed = GetScheduleSchema.parse(args);
    const response = await this.client.getSchedule(parsed.scheduleId);

    if (response.status === 'error') {
      throw new Error(response.error?.message || 'Failed to get schedule');
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  async createSchedule(args: unknown) {
    const parsed = CreateScheduleSchema.parse(args);
    const response = await this.client.createSchedule(parsed);

    if (response.status === 'error') {
      throw new Error(response.error?.message || 'Failed to create schedule');
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  async updateSchedule(args: unknown) {
    const parsed = UpdateScheduleSchema.parse(args);
    const { scheduleId, ...updateData } = parsed;
    const response = await this.client.updateSchedule(scheduleId, updateData);

    if (response.status === 'error') {
      throw new Error(response.error?.message || 'Failed to update schedule');
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  async deleteSchedule(args: unknown) {
    const parsed = DeleteScheduleSchema.parse(args);
    const response = await this.client.deleteSchedule(parsed.scheduleId);

    if (response.status === 'error') {
      throw new Error(response.error?.message || 'Failed to delete schedule');
    }

    return {
      content: [
        {
          type: 'text',
          text: response.data?.message || 'Schedule deleted successfully',
        },
      ],
    };
  }
}

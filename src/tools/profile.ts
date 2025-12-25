/**
 * MCP Tools for Cal.com User Profile
 */

import { z } from 'zod';
import type { CalcomClient } from '../calcom-client.js';

const GetProfileSchema = z.object({});

const UpdateProfileSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  timeZone: z.string().optional(),
  weekStart: z.string().optional(),
  timeFormat: z.number().optional(),
  defaultScheduleId: z.number().int().positive().optional(),
});

export const profileTools = [
  {
    name: 'get_profile',
    description: 'Get the authenticated user\'s Cal.com profile. Returns username, name, email, timezone, and other settings.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'update_profile',
    description: 'Update the authenticated user\'s profile. Can modify name, bio, timezone, week start day, time format, and default schedule.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Display name' },
        bio: { type: 'string', description: 'Bio/description' },
        timeZone: { type: 'string', description: 'Timezone (e.g., America/New_York)' },
        weekStart: { type: 'string', description: 'First day of the week (e.g., Monday)' },
        timeFormat: { type: 'number', description: 'Time format: 12 or 24' },
        defaultScheduleId: { type: 'number', description: 'Default schedule ID' },
      },
      required: [],
    },
  },
];

export class ProfileToolHandlers {
  private client: CalcomClient;

  constructor(client: CalcomClient) {
    this.client = client;
  }

  async getProfile(_args: unknown) {
    GetProfileSchema.parse(_args);
    const result = await this.client.getMe();

    if (result.status === 'error') {
      return { content: [{ type: 'text', text: `Error: ${result.error?.message}` }], isError: true };
    }
    return { content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }] };
  }

  async updateProfile(args: unknown) {
    const parsed = UpdateProfileSchema.parse(args);
    const result = await this.client.updateMe(parsed);

    if (result.status === 'error') {
      return { content: [{ type: 'text', text: `Error: ${result.error?.message}` }], isError: true };
    }
    return { content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }] };
  }
}

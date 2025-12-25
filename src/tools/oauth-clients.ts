/**
 * MCP Tools for Cal.com OAuth Client Management
 */

import { z } from 'zod';
import type { CalcomClient } from '../calcom-client.js';

// Available OAuth permissions
const OAuthPermissionEnum = z.enum([
  'EVENT_TYPE_READ',
  'EVENT_TYPE_WRITE',
  'BOOKING_READ',
  'BOOKING_WRITE',
  'SCHEDULE_READ',
  'SCHEDULE_WRITE',
  'APPS_READ',
  'APPS_WRITE',
  'PROFILE_READ',
  'PROFILE_WRITE',
  '*',
]);

// Zod schemas for input validation
const ListOAuthClientsSchema = z.object({});

const GetOAuthClientSchema = z.object({
  clientId: z.string().min(1),
});

const CreateOAuthClientSchema = z.object({
  name: z.string().min(1),
  redirectUris: z.array(z.string().url()).min(1),
  permissions: z.array(OAuthPermissionEnum).min(1),
  logo: z.string().url().optional(),
  bookingRedirectUri: z.string().url().optional(),
  bookingCancelRedirectUri: z.string().url().optional(),
  bookingRescheduleRedirectUri: z.string().url().optional(),
  areEmailsEnabled: z.boolean().optional(),
  areDefaultEventTypesEnabled: z.boolean().optional(),
  areCalendarEventsEnabled: z.boolean().optional(),
});

const UpdateOAuthClientSchema = z.object({
  clientId: z.string().min(1),
  name: z.string().min(1).optional(),
  logo: z.string().url().optional(),
  redirectUris: z.array(z.string().url()).optional(),
  bookingRedirectUri: z.string().url().optional(),
  bookingCancelRedirectUri: z.string().url().optional(),
  bookingRescheduleRedirectUri: z.string().url().optional(),
  areEmailsEnabled: z.boolean().optional(),
  areDefaultEventTypesEnabled: z.boolean().optional(),
  areCalendarEventsEnabled: z.boolean().optional(),
});

const DeleteOAuthClientSchema = z.object({
  clientId: z.string().min(1),
});

/**
 * Tool definitions for MCP server
 */
export const oauthClientTools = [
  {
    name: 'list_oauth_clients',
    description: 'Get all OAuth clients for the authenticated organization. Returns a list of all OAuth clients with their IDs, names, permissions, and configuration.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_oauth_client',
    description: 'Get details of a specific OAuth client by ID. Returns full client information including permissions, redirect URIs, and settings.',
    inputSchema: {
      type: 'object',
      properties: {
        clientId: {
          type: 'string',
          description: 'The unique identifier of the OAuth client',
        },
      },
      required: ['clientId'],
    },
  },
  {
    name: 'create_oauth_client',
    description: 'Create a new OAuth client for Cal.com integration. Returns the client ID and secret (save the secret securely - it cannot be retrieved later).',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the OAuth client application',
        },
        redirectUris: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of valid redirect URIs for OAuth callbacks (must be valid URLs)',
        },
        permissions: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              'EVENT_TYPE_READ',
              'EVENT_TYPE_WRITE',
              'BOOKING_READ',
              'BOOKING_WRITE',
              'SCHEDULE_READ',
              'SCHEDULE_WRITE',
              'APPS_READ',
              'APPS_WRITE',
              'PROFILE_READ',
              'PROFILE_WRITE',
              '*',
            ],
          },
          description: 'Array of permission scopes. Use "*" for all permissions.',
        },
        logo: {
          type: 'string',
          description: 'URL to the client application logo',
        },
        bookingRedirectUri: {
          type: 'string',
          description: 'Redirect URI after successful booking',
        },
        bookingCancelRedirectUri: {
          type: 'string',
          description: 'Redirect URI after booking cancellation',
        },
        bookingRescheduleRedirectUri: {
          type: 'string',
          description: 'Redirect URI after booking reschedule',
        },
        areEmailsEnabled: {
          type: 'boolean',
          description: 'Enable email notifications for the OAuth client',
        },
        areDefaultEventTypesEnabled: {
          type: 'boolean',
          description: 'If true, managed users will have 4 default event types created automatically',
        },
        areCalendarEventsEnabled: {
          type: 'boolean',
          description: 'If true and managed user has calendar connected, calendar events will be created',
        },
      },
      required: ['name', 'redirectUris', 'permissions'],
    },
  },
  {
    name: 'update_oauth_client',
    description: 'Update an existing OAuth client. You can update the name, redirect URIs, and various settings. Permissions cannot be changed after creation.',
    inputSchema: {
      type: 'object',
      properties: {
        clientId: {
          type: 'string',
          description: 'The unique identifier of the OAuth client to update',
        },
        name: {
          type: 'string',
          description: 'New name for the OAuth client',
        },
        logo: {
          type: 'string',
          description: 'New logo URL for the client',
        },
        redirectUris: {
          type: 'array',
          items: { type: 'string' },
          description: 'New array of redirect URIs (replaces existing)',
        },
        bookingRedirectUri: {
          type: 'string',
          description: 'New redirect URI after successful booking',
        },
        bookingCancelRedirectUri: {
          type: 'string',
          description: 'New redirect URI after booking cancellation',
        },
        bookingRescheduleRedirectUri: {
          type: 'string',
          description: 'New redirect URI after booking reschedule',
        },
        areEmailsEnabled: {
          type: 'boolean',
          description: 'Enable/disable email notifications',
        },
        areDefaultEventTypesEnabled: {
          type: 'boolean',
          description: 'Enable/disable default event types for managed users',
        },
        areCalendarEventsEnabled: {
          type: 'boolean',
          description: 'Enable/disable calendar event creation',
        },
      },
      required: ['clientId'],
    },
  },
  {
    name: 'delete_oauth_client',
    description: 'Delete an OAuth client by ID. This action is irreversible and will invalidate all tokens issued to this client.',
    inputSchema: {
      type: 'object',
      properties: {
        clientId: {
          type: 'string',
          description: 'The unique identifier of the OAuth client to delete',
        },
      },
      required: ['clientId'],
    },
  },
];

/**
 * Tool handlers
 */
export class OAuthClientToolHandlers {
  constructor(private client: CalcomClient) {}

  async listOAuthClients(args: unknown) {
    ListOAuthClientsSchema.parse(args);
    const response = await this.client.listOAuthClients();

    if (response.status === 'error') {
      throw new Error(response.error?.message || 'Failed to list OAuth clients');
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

  async getOAuthClient(args: unknown) {
    const parsed = GetOAuthClientSchema.parse(args);
    const response = await this.client.getOAuthClient(parsed.clientId);

    if (response.status === 'error') {
      throw new Error(response.error?.message || 'Failed to get OAuth client');
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

  async createOAuthClient(args: unknown) {
    const parsed = CreateOAuthClientSchema.parse(args);
    const response = await this.client.createOAuthClient(parsed);

    if (response.status === 'error') {
      throw new Error(response.error?.message || 'Failed to create OAuth client');
    }

    return {
      content: [
        {
          type: 'text',
          text: `OAuth client created successfully!\n\n⚠️ IMPORTANT: Save these credentials securely - the secret cannot be retrieved later!\n\n${JSON.stringify(response.data, null, 2)}`,
        },
      ],
    };
  }

  async updateOAuthClient(args: unknown) {
    const parsed = UpdateOAuthClientSchema.parse(args);
    const { clientId, ...updateData } = parsed;
    const response = await this.client.updateOAuthClient(clientId, updateData);

    if (response.status === 'error') {
      throw new Error(response.error?.message || 'Failed to update OAuth client');
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

  async deleteOAuthClient(args: unknown) {
    const parsed = DeleteOAuthClientSchema.parse(args);
    const response = await this.client.deleteOAuthClient(parsed.clientId);

    if (response.status === 'error') {
      throw new Error(response.error?.message || 'Failed to delete OAuth client');
    }

    return {
      content: [
        {
          type: 'text',
          text: response.data?.message || 'OAuth client deleted successfully',
        },
      ],
    };
  }
}

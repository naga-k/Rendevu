#!/usr/bin/env node

/**
 * Cal.com MCP Server
 * Provides tools for managing Cal.com availability through Claude
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { appConfig } from './config.js';
import { CalcomClient } from './calcom-client.js';
import { scheduleTools, ScheduleToolHandlers } from './tools/schedules.js';
import { oauthClientTools, OAuthClientToolHandlers } from './tools/oauth-clients.js';
import { eventTypeTools, EventTypeToolHandlers } from './tools/event-types.js';
import { bookingTools, BookingToolHandlers } from './tools/bookings.js';
import { slotTools, SlotToolHandlers } from './tools/slots.js';
import { profileTools, ProfileToolHandlers } from './tools/profile.js';

// Initialize Cal.com client
const calcomClient = new CalcomClient(
  appConfig.calcom.apiKey,
  appConfig.calcom.baseUrl,
  appConfig.calcom.apiVersion
);

// Initialize tool handlers
const scheduleHandlers = new ScheduleToolHandlers(calcomClient);
const oauthClientHandlers = new OAuthClientToolHandlers(calcomClient);
const eventTypeHandlers = new EventTypeToolHandlers(calcomClient);
const bookingHandlers = new BookingToolHandlers(calcomClient);
const slotHandlers = new SlotToolHandlers(calcomClient);
const profileHandlers = new ProfileToolHandlers(calcomClient);

// Create MCP server
function createServer() {
  const server = new Server(
    {
      name: 'rendevu',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tool list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        ...scheduleTools,
        ...oauthClientTools,
        ...eventTypeTools,
        ...bookingTools,
        ...slotTools,
        ...profileTools,
      ],
    };
  });

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'list_schedules':
          return await scheduleHandlers.listSchedules(args);
        case 'get_schedule':
          return await scheduleHandlers.getSchedule(args);
        case 'create_schedule':
          return await scheduleHandlers.createSchedule(args);
        case 'update_schedule':
          return await scheduleHandlers.updateSchedule(args);
        case 'delete_schedule':
          return await scheduleHandlers.deleteSchedule(args);
        case 'list_oauth_clients':
          return await oauthClientHandlers.listOAuthClients(args);
        case 'get_oauth_client':
          return await oauthClientHandlers.getOAuthClient(args);
        case 'create_oauth_client':
          return await oauthClientHandlers.createOAuthClient(args);
        case 'update_oauth_client':
          return await oauthClientHandlers.updateOAuthClient(args);
        case 'delete_oauth_client':
          return await oauthClientHandlers.deleteOAuthClient(args);
        // Event Type tools
        case 'list_event_types':
          return await eventTypeHandlers.listEventTypes(args);
        case 'get_event_type':
          return await eventTypeHandlers.getEventType(args);
        case 'create_event_type':
          return await eventTypeHandlers.createEventType(args);
        case 'update_event_type':
          return await eventTypeHandlers.updateEventType(args);
        case 'delete_event_type':
          return await eventTypeHandlers.deleteEventType(args);
        // Booking tools
        case 'list_bookings':
          return await bookingHandlers.listBookings(args);
        case 'get_booking':
          return await bookingHandlers.getBooking(args);
        case 'cancel_booking':
          return await bookingHandlers.cancelBooking(args);
        case 'reschedule_booking':
          return await bookingHandlers.rescheduleBooking(args);
        // Slot tools
        case 'get_available_slots':
          return await slotHandlers.getAvailableSlots(args);
        // Profile tools
        case 'get_profile':
          return await profileHandlers.getProfile(args);
        case 'update_profile':
          return await profileHandlers.updateProfile(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

// Start server
async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Cal.com MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

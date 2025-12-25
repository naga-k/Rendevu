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

// Initialize Cal.com client
const calcomClient = new CalcomClient(
  appConfig.calcom.apiKey,
  appConfig.calcom.baseUrl,
  appConfig.calcom.apiVersion
);

// Initialize tool handlers
const scheduleHandlers = new ScheduleToolHandlers(calcomClient);
const oauthClientHandlers = new OAuthClientToolHandlers(calcomClient);

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
      tools: [...scheduleTools, ...oauthClientTools],
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

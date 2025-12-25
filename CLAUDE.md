# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rendevu is a Model Context Protocol (MCP) server that provides Cal.com management tools directly in Claude chat. It allows you to manage schedules, event types, bookings, availability slots, user profiles, and OAuth clients on Cal.com through natural conversation with Claude.

## Development Commands

```bash
# Install dependencies
npm install

# Development with hot reload
npm run dev

# Run server (uses tsx for TypeScript execution)
npm start

# Type checking without emitting files
npm run typecheck

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Authentication

This MCP server uses **API key authentication** to connect to Cal.com's API v2.

### Setup

1. Copy `.env.example` to `.env`
2. Get your Cal.com API key from: https://app.cal.com/settings/developer/api-keys
3. Configure the following environment variables:
   - `CALCOM_API_KEY`: Your Cal.com API key (must start with `cal_`)
   - `CALCOM_API_BASE_URL`: Cal.com API base URL (defaults to `https://api.cal.com/v2`)
   - `CALCOM_API_VERSION`: Cal.com API version (defaults to `2024-06-11`)

**Note:** The OAuth Client tools (list, create, update, delete OAuth clients) are for *managing OAuth applications on Cal.com* - they do NOT affect how this MCP server authenticates. This server always uses API key auth.

## Architecture

### MCP Server Architecture

The codebase uses the Model Context Protocol to expose Cal.com functionality as tools that Claude can use:

1. **MCP Server** (`src/index.ts`): Main entry point that:
   - Initializes the MCP server with stdio transport
   - Registers tool handlers for schedule management
   - Handles tool execution requests from Claude

2. **Cal.com API Client** (`src/calcom-client.ts`): HTTP client for Cal.com API v2
   - Handles authentication with bearer tokens
   - Manages required headers (`cal-api-version`)
   - Provides methods for schedules and OAuth client operations

3. **Tool Handlers** (`src/tools/`):
   - `schedules.ts`: 5 tools for schedule management
   - `oauth-clients.ts`: 5 tools for OAuth client management
   - `event-types.ts`: 5 tools for event type management
   - `bookings.ts`: 4 tools for booking management
   - `slots.ts`: 1 tool for availability slot queries
   - `profile.ts`: 2 tools for user profile management
   - Validates input using Zod schemas
   - Formats responses for Claude

4. **Configuration** (`src/config.ts`):
   - Loads and validates environment variables
   - Provides typed configuration object

### Available MCP Tools

1. **`list_schedules`**: Get all schedules for the authenticated user
   - No parameters required
   - Returns: Array of schedules with IDs, names, timezones, and default status

2. **`get_schedule`**: Get detailed information about a specific schedule
   - Parameters: `scheduleId` (number)
   - Returns: Full schedule with availability blocks and overrides

3. **`create_schedule`**: Create a new schedule
   - Parameters: `name`, `timeZone`, `isDefault`, optional `availability` and `overrides`
   - Returns: Created schedule details
   - Note: Each user should have one default schedule

4. **`update_schedule`**: Update an existing schedule
   - Parameters: `scheduleId` (required), plus any fields to update
   - Returns: Updated schedule details

5. **`delete_schedule`**: Delete a schedule
   - Parameters: `scheduleId` (number)
   - Returns: Success confirmation

#### OAuth Client Tools (for Cal.com Platform/Organization admins)

These tools manage OAuth applications on Cal.com. Use them to create apps that allow third-party users to connect their Cal.com accounts. **These are NOT for authenticating this MCP server** - this server uses API key auth (see Authentication section above).

6. **`list_oauth_clients`**: Get all OAuth clients for the organization
   - No parameters required
   - Returns: Array of OAuth clients with IDs, names, permissions, and settings

7. **`get_oauth_client`**: Get details of a specific OAuth client
   - Parameters: `clientId` (string)
   - Returns: Full OAuth client details including permissions and redirect URIs

8. **`create_oauth_client`**: Create a new OAuth client for Cal.com integration
   - Parameters: `name`, `redirectUris`, `permissions` (required), plus optional settings
   - Returns: `clientId` and `clientSecret` (save the secret - it cannot be retrieved later!)

9. **`update_oauth_client`**: Update an existing OAuth client
   - Parameters: `clientId` (required), plus any fields to update
   - Returns: Updated OAuth client details
   - Note: Permissions cannot be changed after creation

10. **`delete_oauth_client`**: Delete an OAuth client
    - Parameters: `clientId` (string)
    - Returns: Success confirmation
    - Warning: Invalidates all tokens issued to this client

#### Event Type Tools

11. **`list_event_types`**: Get all event types for the authenticated user
    - No parameters required
    - Returns: Array of event types with IDs, titles, slugs, durations, and settings

12. **`get_event_type`**: Get detailed information about a specific event type
    - Parameters: `eventTypeId` (number)
    - Returns: Full event type details including locations, buffers, and scheduling settings

13. **`create_event_type`**: Create a new event type
    - Parameters: `title`, `slug`, `lengthInMinutes` (required), plus optional `description`, `locations`, `scheduleId`, `hidden`, `requiresConfirmation`, `disableGuests`, `minimumBookingNotice`, `beforeEventBuffer`, `afterEventBuffer`, `slotInterval`
    - Returns: Created event type details

14. **`update_event_type`**: Update an existing event type
    - Parameters: `eventTypeId` (required), plus any fields to update
    - Returns: Updated event type details

15. **`delete_event_type`**: Delete an event type
    - Parameters: `eventTypeId` (number)
    - Returns: Success confirmation

#### Booking Tools

16. **`list_bookings`**: Get all bookings
    - Parameters: Optional `status` (upcoming, past, cancelled, unconfirmed), `eventTypeId`, `attendeeEmail`
    - Returns: Array of bookings

17. **`get_booking`**: Get detailed information about a specific booking
    - Parameters: `bookingUid` (string)
    - Returns: Full booking details

18. **`cancel_booking`**: Cancel a booking
    - Parameters: `bookingUid` (required), optional `cancellationReason`
    - Returns: Success confirmation

19. **`reschedule_booking`**: Reschedule a booking to a new time
    - Parameters: `bookingUid`, `start` (ISO 8601 format) (required), optional `reschedulingReason`
    - Returns: Updated booking details

#### Availability Slot Tools

20. **`get_available_slots`**: Get available time slots for booking
    - Parameters: `startTime`, `endTime` (required, ISO 8601 format), optional `eventTypeId`, `eventTypeSlug`, `username`, `timeZone`
    - Returns: Available slots grouped by date

#### User Profile Tools

21. **`get_profile`**: Get the authenticated user's Cal.com profile
    - No parameters required
    - Returns: Username, name, email, timezone, and other settings

22. **`update_profile`**: Update the authenticated user's profile
    - Parameters: Optional `name`, `bio`, `timeZone`, `weekStart`, `timeFormat`, `defaultScheduleId`
    - Returns: Updated profile details

### Data Types

#### Availability Block
```typescript
{
  days: string[];        // e.g., ["Monday", "Tuesday", "Wednesday"]
  startTime: string;     // HH:MM format (24-hour), e.g., "09:00"
  endTime: string;       // HH:MM format (24-hour), e.g., "17:00"
}
```

#### Schedule Override
```typescript
{
  date: string;          // YYYY-MM-DD format, e.g., "2025-12-25"
  startTime: string;     // HH:MM format (24-hour)
  endTime: string;       // HH:MM format (24-hour)
}
```

#### OAuth Permissions
```typescript
type OAuthPermission =
  | 'EVENT_TYPE_READ' | 'EVENT_TYPE_WRITE'
  | 'BOOKING_READ' | 'BOOKING_WRITE'
  | 'SCHEDULE_READ' | 'SCHEDULE_WRITE'
  | 'APPS_READ' | 'APPS_WRITE'
  | 'PROFILE_READ' | 'PROFILE_WRITE'
  | '*';  // All permissions
```

#### OAuth Client
```typescript
{
  id: string;
  name: string;
  secret: string;
  permissions: OAuthPermission[];
  redirectUris: string[];
  organizationId: number;
  createdAt: string;
  areEmailsEnabled: boolean;
  areDefaultEventTypesEnabled: boolean;  // Auto-create 4 default event types for managed users
  areCalendarEventsEnabled: boolean;     // Create calendar events when calendar connected
  logo?: string;
  bookingRedirectUri?: string;
  bookingCancelRedirectUri?: string;
  bookingRescheduleRedirectUri?: string;
}
```

### Type System

All type definitions are in `src/types/`:
- `calcom.ts`: Cal.com API types (schedules, OAuth clients, event types, bookings, slots, user profile, availability, overrides, API responses)
- `index.ts`: Re-exports all types

### Key Implementation Details

- **MCP Protocol**: Uses `@modelcontextprotocol/sdk` for stdio communication with Claude
- **Transport**: stdio transport for Claude Desktop integration
- **Validation**: Zod schemas validate all tool inputs
- **Error Handling**: All errors are caught and returned with descriptive messages
- **TypeScript Configuration**:
  - Uses ES modules (`"type": "module"` in package.json)
  - `NodeNext` module resolution
  - Runs directly via `tsx` (no build step required)

## Adding New Features

### Adding a New Cal.com Tool

1. Add the API method to `CalcomClient` in `src/calcom-client.ts`
2. Define the tool schema and handler in `src/tools/` (create new file if for different resource)
3. Register the tool in `src/index.ts`:
   - Add to tool definitions array
   - Add case in tool handler switch statement
4. Update TypeScript types in `src/types/calcom.ts` if needed

### Example: Adding a New Resource

For example, to add a new "Webhooks" resource:

1. Add methods to `CalcomClient`:
   ```typescript
   async listWebhooks() { ... }
   async createWebhook(data) { ... }
   ```

2. Create `src/tools/webhooks.ts` with tool definitions and handlers

3. Register in `src/index.ts`:
   ```typescript
   import { webhookTools, WebhookToolHandlers } from './tools/webhooks.js';
   ```

4. Add the tools to the tools array and switch statement

## Claude Desktop Integration

To use this MCP server with Claude Desktop:

1. Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):
   ```json
   {
     "mcpServers": {
       "rendevu": {
         "command": "npx",
         "args": ["tsx", "/path/to/Rendevu/src/index.ts"],
         "env": {
           "CALCOM_API_KEY": "cal_your-api-key"
         }
       }
     }
   }
   ```
2. Restart Claude Desktop
3. The Cal.com tools will be available in your conversations

## Contributing

### Creating a Pull Request

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. Make your changes and ensure tests pass:
   ```bash
   npm run typecheck
   npm test
   ```

3. Commit with a descriptive message:
   ```bash
   git add .
   git commit -m "feat: Add your feature description"
   ```

4. Push and create PR:
   ```bash
   git push -u origin feat/your-feature-name
   gh pr create --title "feat: Your feature" --body "Description of changes"
   ```

### Commit Message Format

Follow conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests

### Testing

All new features should include tests. Tests are located in `src/__tests__/` and use Vitest.

```bash
# Run all tests
npm test

# Run tests in watch mode during development
npm run test:watch
```

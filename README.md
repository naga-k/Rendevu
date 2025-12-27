# Rendevu

**Manage Cal.com availability through Claude chat using MCP**

[![MCP](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io)
[![Cal.com](https://img.shields.io/badge/Cal.com-API%20v2-orange)](https://cal.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## What is Rendevu?

Rendevu connects Claude to your Cal.com account through the Model Context Protocol (MCP). Manage your scheduling availability through natural conversation:

- **"Show me my schedules"** → Lists all your Cal.com schedules
- **"Create a schedule for client meetings, Mon-Fri 10am-4pm EST"** → Done
- **"I'm off on Christmas, add that override"** → Added
- **"Update my schedule to include Saturday mornings"** → Updated

No more switching between apps. Just chat with Claude.

---

## Quick Start

1. **Clone & Install**
   ```bash
   git clone https://github.com/naga-k/Rendevu.git
   cd rendevu
   npm install
   ```

2. **Get your Cal.com API key**
   → [app.cal.com/settings/developer/api-keys](https://app.cal.com/settings/developer/api-keys)

3. **Configure Claude Desktop**

   Edit your config file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

   ```json
   {
     "mcpServers": {
       "rendevu": {
         "command": "npx",
         "args": ["tsx", "/path/to/rendevu/src/index.ts"],
         "env": {
           "CALCOM_API_KEY": "cal_your-api-key"
         }
       }
     }
   }
   ```

4. **Restart Claude Desktop**

---

## Available Tools

### Schedule Management
| Tool | Description |
|------|-------------|
| `list_schedules` | Get all your schedules |
| `get_schedule` | View schedule details with availability blocks |
| `create_schedule` | Create a new schedule |
| `update_schedule` | Modify availability, timezone, or name |
| `delete_schedule` | Remove a schedule |

### Event Types
| Tool | Description |
|------|-------------|
| `list_event_types` | Get all your event types |
| `get_event_type` | View event type details |
| `create_event_type` | Create a new event type |
| `update_event_type` | Modify title, duration, visibility |
| `delete_event_type` | Remove an event type |

### Bookings
| Tool | Description |
|------|-------------|
| `list_bookings` | Get bookings (filter by status, event type) |
| `get_booking` | View booking details |
| `cancel_booking` | Cancel a booking |
| `reschedule_booking` | Reschedule to a new time |

### Availability
| Tool | Description |
|------|-------------|
| `get_available_slots` | Check open time slots for booking |

### Profile
| Tool | Description |
|------|-------------|
| `get_profile` | View your Cal.com profile |
| `update_profile` | Update name, bio, timezone |

### OAuth Client Management (Platform/Org Admins)
| Tool | Description |
|------|-------------|
| `list_oauth_clients` | List OAuth apps in your organization |
| `get_oauth_client` | View OAuth client details |
| `create_oauth_client` | Create a new OAuth integration |
| `update_oauth_client` | Update client settings |
| `delete_oauth_client` | Remove an OAuth client |

---

## Example Conversations

**Manage availability across timezones:**
> "What times work for London, India, and California in my current schedule?"

**Quick schedule changes:**
> "Make me available only Tuesday and Thursday, 8:30-10am"

**Date overrides:**
> "Block out December 24-26 on my default schedule"

---

## Development

```bash
npm run dev        # Hot reload development
npm run typecheck  # Type checking
npm start          # Run server
```

### Project Structure
```
src/
├── index.ts           # MCP server entry
├── calcom-client.ts   # Cal.com API client
├── config.ts          # Environment config
├── tools/
│   ├── schedules.ts      # Schedule tools
│   ├── event-types.ts    # Event type tools
│   ├── bookings.ts       # Booking tools
│   ├── slots.ts          # Availability slots
│   ├── profile.ts        # User profile tools
│   └── oauth-clients.ts  # OAuth tools
└── types/
    └── calcom.ts      # Type definitions
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tools not showing | Check path is absolute, restart Claude Desktop |
| API errors | Verify API key starts with `cal_` |
| Missing env var | Set `CALCOM_API_KEY` in config or `.env` |

---

## Links

- [Cal.com API Docs](https://cal.com/docs/api-reference/v2/introduction)
- [MCP Protocol](https://modelcontextprotocol.io)

---

**MIT License** | Built by [Naga Karumuri](https://github.com/naga-k)

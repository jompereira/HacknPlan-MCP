# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # Install dependencies
npm start         # Run the MCP server (requires HACKNPLAN_API_KEY env var)
HACKNPLAN_API_KEY=your_key node index.js  # Run with key inline
```

There are no tests or linting configured.

## Architecture

This is a single-file MCP (Model Context Protocol) server (`index.js`) that bridges Claude to the HacknPlan game dev project management API.

**Entry point:** `index.js` — the entire server lives here, structured in three sections:
1. **`TOOLS` array** — MCP tool definitions with JSON schemas (what Claude sees)
2. **`handleTool(name, args)`** — switch/case dispatch that maps tool calls to HacknPlan REST API requests
3. **Server wiring** — `@modelcontextprotocol/sdk` server connected via stdio transport

**`hnpRequest(path, method, body)`** is the single HTTP helper. It authenticates with `Authorization: ApiKey <key>`, always targets `https://api.hacknplan.com/v0`, and returns parsed JSON (or `null` for 204s).

**Resource hierarchy in HacknPlan:** Projects → Boards / Milestones → Work Items. Most endpoints are scoped under `/projects/{projectId}/...`. Work items require a `boardId` on creation.

**Priority IDs for work items:** 0=None, 1=Low, 2=Medium, 3=High, 4=Critical.

**Rate limit:** 5 calls/second (HacknPlan public beta constraint).

## Registering with Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "hacknplan": {
      "command": "node",
      "args": ["/absolute/path/to/hacknplan-mcp/index.js"],
      "env": { "HACKNPLAN_API_KEY": "your_api_key_here" }
    }
  }
}
```

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # Install dependencies
npm test          # Run tests (node --test, no extra deps needed)
npm start         # Run the MCP server (requires HACKNPLAN_API_KEY env var)
HACKNPLAN_API_KEY=your_key node index.js  # Run with key inline
```

## Architecture

The server is split across two files:

- **`lib.js`** — exports `TOOLS`, `handleTool`, `hnpRequest`. Contains all business logic: tool definitions, request dispatch, and the HTTP helper. This is the file to edit when adding or changing tools.
- **`index.js`** — MCP server wiring only. Imports from `lib.js`, registers the stdio transport, and guards for the API key env var.
- **`lib.test.js`** — unit tests using Node's built-in `node:test`, mocking `globalThis.fetch`.

**`hnpRequest(path, method, body)`** authenticates with `Authorization: ApiKey <key>`, targets `https://api.hacknplan.com/v0`, and returns parsed JSON (or `null` for 204s).

**Resource hierarchy in HacknPlan:** Projects → Boards / Milestones → Work Items. Most endpoints are scoped under `/projects/{projectId}/...`.

**Creating work items:** `boardId` is a query param (`?boardId=...`), not in the body. `importanceLevelId` is required by the API (defaults to `3` / Normal in the handler). Use `list_importance_levels` to get project-specific values.

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

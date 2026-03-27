# HacknPlan MCP Server

Connect Claude directly to your [HacknPlan](https://hacknplan.com) game dev projects.

## Setup

### 1. Get your API key
1. Log in to HacknPlan
2. Go to **Profile → Settings → API Beta → Create**
3. Name it (e.g. `claude-mcp`), select desired scopes, click **Create**
4. Copy the key

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Claude Desktop

Add this to your `claude_desktop_config.json`:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "hacknplan": {
      "command": "node",
      "args": ["/absolute/path/to/hacknplan-mcp/index.js"],
      "env": {
        "HACKNPLAN_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### 4. Restart Claude Desktop

## Available Tools

| Tool | Description |
|---|---|
| `list_projects` | List all projects in your workspace |
| `get_project` | Get project details |
| `create_project` | Create a new project |
| `update_project` | Update project name/description |
| `list_boards` | List boards in a project |
| `get_board` | Get board details |
| `create_board` | Create a new board |
| `list_milestones` | List milestones in a project |
| `get_milestone` | Get milestone details |
| `create_milestone` | Create a milestone (with optional dates) |
| `close_milestone` | Mark a milestone complete |
| `reopen_milestone` | Reopen a closed milestone |
| `list_work_items` | List work items (with filters: board, stage, category, user, completed) |
| `get_work_item` | Get full work item details |
| `create_work_item` | Create a task with title, description, priority, assignee, estimate, due date, tags |
| `update_work_item` | Update any field on a work item |
| `delete_work_item` | Delete a work item |
| `list_categories` | List work item categories |
| `list_stages` | List workflow stages |
| `list_project_users` | List users in a project |
| `get_current_user` | Get your own user info |

## Example prompts

- *"Show me all work items in my Maze Racer project"*
- *"Create a task called 'Implement leaderboard' in the Programming board, high priority"*
- *"Close the current milestone and list what's still open"*
- *"What tasks are assigned to me and not completed?"*

## Notes

- The HacknPlan API is still in **public beta** — rate limit is 5 calls/second
- API key needs appropriate scopes for the operations you want to perform

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

### Projects
| Tool | Description |
|---|---|
| `list_projects` | List all projects in your workspace |
| `get_project` | Get project details |
| `create_project` | Create a new project (`costMetric` required: `"points"` or `"hours"`) |
| `update_project` | Partially update a project's name or description (PATCH) |
| `replace_project` | Full replacement of a project (PUT) |
| `delete_project` | Permanently delete a project |
| `close_project` | Archive (close) a project |
| `reopen_project` | Reopen a closed project |
| `get_project_metrics` | Get progress and burndown metrics for a project |
| `change_project_owner` | Transfer project ownership to another user |

### Boards
| Tool | Description |
|---|---|
| `list_boards` | List boards in a project (optionally include closed) |
| `get_board` | Get board details |
| `create_board` | Create a new board (optionally attach to a milestone) |
| `update_board` | Partially update a board (PATCH) |
| `replace_board` | Full replacement of a board (PUT) |
| `delete_board` | Permanently delete a board (optionally remove work items) |
| `close_board` | Archive (close) a board |
| `reopen_board` | Reopen a closed board |
| `get_board_metrics` | Get progress and burndown metrics for a board |
| `set_default_board` | Set the default board for a project |
| `clear_default_board` | Remove the default board setting |

### Milestones
| Tool | Description |
|---|---|
| `list_milestones` | List milestones in a project |
| `get_milestone` | Get milestone details (optionally embed boards) |
| `create_milestone` | Create a milestone with optional dates |
| `update_milestone` | Partially update a milestone (PATCH) |
| `replace_milestone` | Full replacement of a milestone (PUT) |
| `delete_milestone` | Permanently delete a milestone (optionally cascade to boards/work items) |
| `close_milestone` | Mark a milestone complete |
| `reopen_milestone` | Reopen a closed milestone |
| `get_milestone_metrics` | Get progress and burndown metrics for a milestone |

### Work Items
| Tool | Description |
|---|---|
| `list_work_items` | List work items with filters (board, milestone, stage, category, user, completion, search, sort) |
| `get_work_item` | Get full work item details |
| `create_work_item` | Create a task with title, description, priority, assignee, estimate, due date, tags |
| `update_work_item` | Update any field on a work item (PATCH) |
| `clone_work_item` | Create a copy of an existing work item |
| `delete_work_item` | Delete a work item |
| `list_work_item_attachments` | List attachments on a work item |
| `get_work_item_attachment` | Get a specific work item attachment |
| `delete_work_item_attachment` | Delete a work item attachment |

### Categories
| Tool | Description |
|---|---|
| `list_categories` | List work item categories in a project |
| `get_category` | Get category details |
| `create_category` | Create a new category |
| `update_category` | Partially update a category (PATCH) |
| `delete_category` | Delete a category |

### Stages
| Tool | Description |
|---|---|
| `list_stages` | List workflow stages in a project |
| `get_stage` | Get stage details |
| `create_stage` | Create a new stage |
| `update_stage` | Partially update a stage (PATCH) |
| `delete_stage` | Delete a stage |

### Importance Levels
| Tool | Description |
|---|---|
| `list_importance_levels` | List importance levels in a project |
| `get_importance_level` | Get importance level details |
| `create_importance_level` | Create a new importance level |
| `update_importance_level` | Partially update an importance level (PATCH) |
| `delete_importance_level` | Delete an importance level |

### Users & Roles
| Tool | Description |
|---|---|
| `get_current_user` | Get your own user info |
| `list_project_users` | List users in a project |
| `get_project_user` | Get a specific user's project membership |
| `add_project_user` | Add a user to a project |
| `update_project_user` | Partially update a user's project membership (PATCH) |
| `replace_project_user` | Full replacement of a user's project membership (PUT) |
| `add_team_to_project` | Add an entire team to a project |
| `list_project_roles` | List roles in a project |
| `get_project_role` | Get a specific role |
| `create_project_role` | Create a new role |
| `update_project_role` | Partially update a role (PATCH) |
| `replace_project_role` | Full replacement of a role (PUT) |
| `delete_project_role` | Delete a role |

### Tags
| Tool | Description |
|---|---|
| `list_project_tags` | List tags in a project |
| `create_project_tag` | Create a new tag (with optional hex color) |
| `update_project_tag` | Partially update a tag (PATCH) |
| `replace_project_tag` | Full replacement of a tag (PUT) |
| `delete_project_tag` | Delete a tag |

### Design Elements (GDD)
| Tool | Description |
|---|---|
| `list_design_elements` | List design elements (GDD documents) in a project |
| `get_design_element` | Get design element details |
| `create_design_element` | Create a new design element |
| `update_design_element` | Partially update a design element (PATCH) |
| `replace_design_element` | Full replacement of a design element (PUT) |
| `delete_design_element` | Delete a design element |
| `get_design_element_metrics` | Get metrics for a design element |
| `list_design_element_types` | List design element types in a project |
| `get_design_element_type` | Get a specific design element type |
| `create_design_element_type` | Create a new design element type |
| `update_design_element_type` | Partially update a design element type (PATCH) |
| `replace_design_element_type` | Full replacement of a design element type (PUT) |
| `delete_design_element_type` | Delete a design element type |
| `list_design_element_attachments` | List attachments on a design element |
| `get_design_element_attachment` | Get a specific design element attachment |
| `delete_design_element_attachment` | Delete a design element attachment |
| `list_design_element_comments` | List comments on a design element |
| `create_design_element_comment` | Add a comment to a design element |
| `update_design_element_comment` | Update a design element comment (PUT) |
| `delete_design_element_comment` | Delete a design element comment |

### Events, Files & Webhooks
| Tool | Description |
|---|---|
| `list_project_events` | List activity events for a project |
| `list_project_files` | List files stored in a project |
| `delete_project_file` | Delete a file from a project |
| `get_project_storage` | Get file storage quota and usage |
| `list_webhook_event_types` | List all available webhook event types |
| `list_webhooks` | List webhooks configured for a project |
| `create_webhook` | Create a webhook for a project |
| `get_webhook` | Get webhook details |
| `update_webhook` | Partially update a webhook (PATCH) |
| `replace_webhook` | Full replacement of a webhook (PUT) |
| `delete_webhook` | Delete a webhook |

## Example prompts

- *"Show me all work items in my Maze Racer project"*
- *"Create a task called 'Implement leaderboard' in the Programming board, high priority"*
- *"Close the current milestone and list what's still open"*
- *"What tasks are assigned to me and not completed?"*
- *"Create a GDD document for the combat system"*
- *"Set up a webhook to notify my server when work items change"*

## Notes

- The HacknPlan API is still in **public beta** — rate limit is 5 calls/second
- API key needs appropriate scopes for the operations you want to perform
- Categories, stages, and importance levels return 403 on write operations for most accounts (list/get still work)
- `create_work_item` requires `boardId`; `importanceLevelId` defaults to 3 (Normal)
- When creating a work item with a `stageId`, the handler issues a follow-up PATCH since the API ignores `stageId` on POST

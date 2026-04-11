const BASE_URL = "https://api.hacknplan.com/v0";

export async function hnpRequest(path, method = "GET", body = null) {
  const API_KEY = process.env.HACKNPLAN_API_KEY;
  const opts = {
    method,
    headers: {
      Authorization: `ApiKey ${API_KEY}`,
      "Content-Type": "application/json",
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HacknPlan API error ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text.trim()) return null;
  return JSON.parse(text);
}

export const TOOLS = [
  // ── Projects ──────────────────────────────────────────────────────────────
  {
    name: "list_projects",
    description: "List all projects in your workspace",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Max results (default 20)" },
        offset: { type: "number", description: "Pagination offset" },
      },
    },
  },
  {
    name: "get_project",
    description: "Get details of a specific project",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number", description: "Project ID" },
      },
    },
  },
  {
    name: "create_project",
    description: "Create a new project",
    inputSchema: {
      type: "object",
      required: ["name", "costMetric"],
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        costMetric: { type: "string", description: "Cost metric: 'points' or 'hours'" },
      },
    },
  },
  {
    name: "update_project",
    description: "Partially update a project's name or description (PATCH — only provided fields are changed)",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number" },
        name: { type: "string" },
        description: { type: "string" },
      },
    },
  },
  {
    name: "delete_project",
    description: "Permanently delete a project",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number" },
      },
    },
  },
  {
    name: "close_project",
    description: "Archive (close) a project without deleting it. Use reopen_project to restore it.",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number" },
      },
    },
  },
  {
    name: "reopen_project",
    description: "Reopen a previously closed (archived) project",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number" },
      },
    },
  },
  {
    name: "get_project_metrics",
    description: "Get progress and burndown metrics for a project",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number" },
      },
    },
  },
  {
    name: "change_project_owner",
    description: "Transfer ownership of a project to another user",
    inputSchema: {
      type: "object",
      required: ["projectId", "userId"],
      properties: {
        projectId: { type: "number" },
        userId: { type: "number", description: "User ID of the new owner" },
      },
    },
  },

  // ── Boards ────────────────────────────────────────────────────────────────
  {
    name: "list_boards",
    description: "List all boards in a project",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number" },
        includeClosed: { type: "boolean", description: "Include archived boards (default false)" },
      },
    },
  },
  {
    name: "get_board",
    description: "Get details of a specific board",
    inputSchema: {
      type: "object",
      required: ["projectId", "boardId"],
      properties: {
        projectId: { type: "number" },
        boardId: { type: "number" },
      },
    },
  },
  {
    name: "create_board",
    description: "Create a new board in a project",
    inputSchema: {
      type: "object",
      required: ["projectId", "name"],
      properties: {
        projectId: { type: "number" },
        name: { type: "string" },
        milestoneId: { type: "number", description: "Optional milestone to attach the board to" },
      },
    },
  },
  {
    name: "update_board",
    description: "Partially update a board (PATCH — only provided fields are changed)",
    inputSchema: {
      type: "object",
      required: ["projectId", "boardId"],
      properties: {
        projectId: { type: "number" },
        boardId: { type: "number" },
        name: { type: "string" },
        milestoneId: { type: "number" },
      },
    },
  },
  {
    name: "delete_board",
    description: "Permanently delete a board",
    inputSchema: {
      type: "object",
      required: ["projectId", "boardId"],
      properties: {
        projectId: { type: "number" },
        boardId: { type: "number" },
        removeWorkItems: { type: "boolean", description: "Also delete all work items on this board (default false)" },
      },
    },
  },
  {
    name: "close_board",
    description: "Archive (close) a board without deleting it. Use reopen_board to restore it.",
    inputSchema: {
      type: "object",
      required: ["projectId", "boardId"],
      properties: {
        projectId: { type: "number" },
        boardId: { type: "number" },
      },
    },
  },
  {
    name: "reopen_board",
    description: "Reopen a previously closed (archived) board",
    inputSchema: {
      type: "object",
      required: ["projectId", "boardId"],
      properties: {
        projectId: { type: "number" },
        boardId: { type: "number" },
      },
    },
  },
  {
    name: "get_board_metrics",
    description: "Get progress and burndown metrics for a board",
    inputSchema: {
      type: "object",
      required: ["projectId", "boardId"],
      properties: {
        projectId: { type: "number" },
        boardId: { type: "number" },
      },
    },
  },

  // ── Milestones ────────────────────────────────────────────────────────────
  {
    name: "list_milestones",
    description: "List all milestones in a project",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number" },
      },
    },
  },
  {
    name: "get_milestone",
    description: "Get details of a specific milestone",
    inputSchema: {
      type: "object",
      required: ["projectId", "milestoneId"],
      properties: {
        projectId: { type: "number" },
        milestoneId: { type: "number" },
        includeBoards: { type: "boolean", description: "Embed associated boards in the response (default false)" },
      },
    },
  },
  {
    name: "create_milestone",
    description: "Create a new milestone in a project",
    inputSchema: {
      type: "object",
      required: ["projectId", "name"],
      properties: {
        projectId: { type: "number" },
        name: { type: "string" },
        description: { type: "string" },
        startDate: { type: "string", description: "ISO 8601 date string" },
        endDate: { type: "string", description: "ISO 8601 date string" },
      },
    },
  },
  {
    name: "update_milestone",
    description: "Partially update a milestone (PATCH — only provided fields are changed)",
    inputSchema: {
      type: "object",
      required: ["projectId", "milestoneId"],
      properties: {
        projectId: { type: "number" },
        milestoneId: { type: "number" },
        name: { type: "string" },
        description: { type: "string" },
        startDate: { type: "string", description: "ISO 8601 date string" },
        endDate: { type: "string", description: "ISO 8601 date string" },
      },
    },
  },
  {
    name: "delete_milestone",
    description: "Permanently delete a milestone",
    inputSchema: {
      type: "object",
      required: ["projectId", "milestoneId"],
      properties: {
        projectId: { type: "number" },
        milestoneId: { type: "number" },
        deleteBoards: { type: "boolean", description: "Also delete all boards in this milestone (default false)" },
        deleteWorkItems: { type: "boolean", description: "Also delete all work items (default false)" },
      },
    },
  },
  {
    name: "close_milestone",
    description: "Archive (close) a milestone without deleting it. Use reopen_milestone to restore it.",
    inputSchema: {
      type: "object",
      required: ["projectId", "milestoneId"],
      properties: {
        projectId: { type: "number" },
        milestoneId: { type: "number" },
      },
    },
  },
  {
    name: "reopen_milestone",
    description: "Reopen a previously closed (archived) milestone",
    inputSchema: {
      type: "object",
      required: ["projectId", "milestoneId"],
      properties: {
        projectId: { type: "number" },
        milestoneId: { type: "number" },
      },
    },
  },
  {
    name: "get_milestone_metrics",
    description: "Get progress and burndown metrics for a milestone",
    inputSchema: {
      type: "object",
      required: ["projectId", "milestoneId"],
      properties: {
        projectId: { type: "number" },
        milestoneId: { type: "number" },
      },
    },
  },

  // ── Work Items ────────────────────────────────────────────────────────────
  {
    name: "list_work_items",
    description: "List work items in a project with optional filters and sorting",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number" },
        boardId: { type: "number", description: "Filter by board" },
        milestoneId: { type: "number", description: "Filter by milestone" },
        stageId: { type: "number", description: "Filter by stage" },
        categoryId: { type: "number", description: "Filter by category" },
        assignedUserId: { type: "number", description: "Filter by assignee" },
        importanceLevelId: { type: "number", description: "Filter by importance level" },
        parentStoryId: { type: "number", description: "Filter by parent story (returns sub-tasks)" },
        designElementId: { type: "number", description: "Filter by linked design element" },
        isCompleted: { type: "boolean", description: "Filter by completion status" },
        searchTerms: { type: "string", description: "Full-text search across title and description" },
        sortField: { type: "string", description: "Field to sort by" },
        sortMode: { type: "string", description: "Sort direction: 'asc' or 'desc'" },
        limit: { type: "number", description: "Max results (default 20, max 100)" },
        offset: { type: "number", description: "Pagination offset" },
      },
    },
  },
  {
    name: "get_work_item",
    description: "Get details of a specific work item",
    inputSchema: {
      type: "object",
      required: ["projectId", "workItemId"],
      properties: {
        projectId: { type: "number" },
        workItemId: { type: "number" },
      },
    },
  },
  {
    name: "create_work_item",
    description: "Create a new work item (task) in a project",
    inputSchema: {
      type: "object",
      required: ["projectId", "title", "boardId"],
      properties: {
        projectId: { type: "number" },
        boardId: { type: "number" },
        title: { type: "string" },
        description: { type: "string" },
        isStory: { type: "boolean", description: "True for user stories, false for tasks (default false)" },
        parentStoryId: { type: "number", description: "ID of the parent story (for sub-tasks)" },
        categoryId: { type: "number" },
        stageId: { type: "number" },
        assignedUserId: { type: "number" },
        estimatedTime: { type: "number", description: "Estimated time in hours" },
        dueDate: { type: "string", description: "ISO 8601 date string" },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "List of tag strings",
        },
        importanceLevelId: {
          type: "number",
          description: "Importance: 1=Urgent, 2=High, 3=Normal (default), 4=Low",
        },
      },
    },
  },
  {
    name: "update_work_item",
    description: "Update an existing work item",
    inputSchema: {
      type: "object",
      required: ["projectId", "workItemId"],
      properties: {
        projectId: { type: "number" },
        workItemId: { type: "number" },
        title: { type: "string" },
        description: { type: "string" },
        categoryId: { type: "number" },
        stageId: { type: "number" },
        assignedUserId: { type: "number" },
        estimatedTime: { type: "number" },
        dueDate: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        importanceLevelId: { type: "number", description: "Importance: 1=Urgent, 2=High, 3=Normal, 4=Low" },
        isCompleted: { type: "boolean" },
      },
    },
  },
  {
    name: "clone_work_item",
    description: "Create a copy of an existing work item",
    inputSchema: {
      type: "object",
      required: ["projectId", "workItemId"],
      properties: {
        projectId: { type: "number" },
        workItemId: { type: "number" },
        boardId: { type: "number", description: "Target board for the clone (defaults to same board)" },
      },
    },
  },
  {
    name: "delete_work_item",
    description: "Permanently delete a work item",
    inputSchema: {
      type: "object",
      required: ["projectId", "workItemId"],
      properties: {
        projectId: { type: "number" },
        workItemId: { type: "number" },
      },
    },
  },

  // ── Categories ────────────────────────────────────────────────────────────
  {
    name: "list_categories",
    description: "List work item categories in a project",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number" },
      },
    },
  },
  {
    name: "create_category",
    description: "Create a new work item category in a project",
    inputSchema: {
      type: "object",
      required: ["projectId", "name"],
      properties: {
        projectId: { type: "number" },
        name: { type: "string" },
        description: { type: "string" },
      },
    },
  },
  {
    name: "get_category",
    description: "Get details of a specific category",
    inputSchema: {
      type: "object",
      required: ["projectId", "categoryId"],
      properties: {
        projectId: { type: "number" },
        categoryId: { type: "number" },
      },
    },
  },
  {
    name: "update_category",
    description: "Partially update a category (PATCH — only provided fields are changed)",
    inputSchema: {
      type: "object",
      required: ["projectId", "categoryId"],
      properties: {
        projectId: { type: "number" },
        categoryId: { type: "number" },
        name: { type: "string" },
        description: { type: "string" },
      },
    },
  },
  {
    name: "delete_category",
    description: "Permanently delete a category",
    inputSchema: {
      type: "object",
      required: ["projectId", "categoryId"],
      properties: {
        projectId: { type: "number" },
        categoryId: { type: "number" },
      },
    },
  },

  // ── Stages ────────────────────────────────────────────────────────────────
  {
    name: "list_stages",
    description: "List workflow stages in a project",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number" },
      },
    },
  },
  {
    name: "create_stage",
    description: "Create a new workflow stage in a project",
    inputSchema: {
      type: "object",
      required: ["projectId", "name"],
      properties: {
        projectId: { type: "number" },
        name: { type: "string" },
        description: { type: "string" },
      },
    },
  },
  {
    name: "get_stage",
    description: "Get details of a specific stage",
    inputSchema: {
      type: "object",
      required: ["projectId", "stageId"],
      properties: {
        projectId: { type: "number" },
        stageId: { type: "number" },
      },
    },
  },
  {
    name: "update_stage",
    description: "Partially update a stage (PATCH — only provided fields are changed)",
    inputSchema: {
      type: "object",
      required: ["projectId", "stageId"],
      properties: {
        projectId: { type: "number" },
        stageId: { type: "number" },
        name: { type: "string" },
        description: { type: "string" },
      },
    },
  },
  {
    name: "delete_stage",
    description: "Permanently delete a stage",
    inputSchema: {
      type: "object",
      required: ["projectId", "stageId"],
      properties: {
        projectId: { type: "number" },
        stageId: { type: "number" },
      },
    },
  },

  // ── Importance Levels ─────────────────────────────────────────────────────
  {
    name: "list_importance_levels",
    description: "List importance levels in a project (used as importanceLevelId when creating work items)",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number" },
      },
    },
  },
  {
    name: "create_importance_level",
    description: "Create a new importance level in a project",
    inputSchema: {
      type: "object",
      required: ["projectId", "name"],
      properties: {
        projectId: { type: "number" },
        name: { type: "string" },
        description: { type: "string" },
      },
    },
  },
  {
    name: "get_importance_level",
    description: "Get details of a specific importance level",
    inputSchema: {
      type: "object",
      required: ["projectId", "importanceLevelId"],
      properties: {
        projectId: { type: "number" },
        importanceLevelId: { type: "number" },
      },
    },
  },
  {
    name: "update_importance_level",
    description: "Partially update an importance level (PATCH — only provided fields are changed)",
    inputSchema: {
      type: "object",
      required: ["projectId", "importanceLevelId"],
      properties: {
        projectId: { type: "number" },
        importanceLevelId: { type: "number" },
        name: { type: "string" },
        description: { type: "string" },
      },
    },
  },
  {
    name: "delete_importance_level",
    description: "Permanently delete an importance level",
    inputSchema: {
      type: "object",
      required: ["projectId", "importanceLevelId"],
      properties: {
        projectId: { type: "number" },
        importanceLevelId: { type: "number" },
      },
    },
  },

  // ── Users ─────────────────────────────────────────────────────────────────
  {
    name: "list_project_users",
    description: "List users in a project",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number" },
      },
    },
  },
  {
    name: "get_project_user",
    description: "Get details of a specific user within a project",
    inputSchema: {
      type: "object",
      required: ["projectId", "userId"],
      properties: {
        projectId: { type: "number" },
        userId: { type: "number" },
      },
    },
  },
  {
    name: "get_current_user",
    description: "Get information about the currently authenticated user",
    inputSchema: { type: "object", properties: {} },
  },

  // ── Full-replace (PUT) variants ───────────────────────────────────────────
  {
    name: "replace_project",
    description: "Full replacement of a project (PUT — all fields required)",
    inputSchema: {
      type: "object",
      required: ["projectId", "name", "costMetric"],
      properties: {
        projectId: { type: "number" },
        name: { type: "string" },
        description: { type: "string" },
        costMetric: { type: "string", description: "'points' or 'hours'" },
      },
    },
  },
  {
    name: "replace_board",
    description: "Full replacement of a board (PUT — all fields required)",
    inputSchema: {
      type: "object",
      required: ["projectId", "boardId", "name"],
      properties: {
        projectId: { type: "number" },
        boardId: { type: "number" },
        name: { type: "string" },
        milestoneId: { type: "number" },
      },
    },
  },
  {
    name: "replace_milestone",
    description: "Full replacement of a milestone (PUT — all fields required)",
    inputSchema: {
      type: "object",
      required: ["projectId", "milestoneId", "name"],
      properties: {
        projectId: { type: "number" },
        milestoneId: { type: "number" },
        name: { type: "string" },
        description: { type: "string" },
        startDate: { type: "string", description: "ISO 8601 date string" },
        endDate: { type: "string", description: "ISO 8601 date string" },
      },
    },
  },

  // ── Default board ─────────────────────────────────────────────────────────
  {
    name: "set_default_board",
    description: "Set the default board for a project",
    inputSchema: {
      type: "object",
      required: ["projectId", "boardId"],
      properties: {
        projectId: { type: "number" },
        boardId: { type: "number" },
      },
    },
  },
  {
    name: "clear_default_board",
    description: "Remove the default board setting for a project",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number" },
      },
    },
  },

  // ── Work Item Attachments ─────────────────────────────────────────────────
  {
    name: "list_work_item_attachments",
    description: "List all attachments on a work item",
    inputSchema: {
      type: "object",
      required: ["projectId", "workItemId"],
      properties: {
        projectId: { type: "number" },
        workItemId: { type: "number" },
      },
    },
  },
  {
    name: "get_work_item_attachment",
    description: "Get details of a specific work item attachment",
    inputSchema: {
      type: "object",
      required: ["projectId", "workItemId", "attachmentId"],
      properties: {
        projectId: { type: "number" },
        workItemId: { type: "number" },
        attachmentId: { type: "number" },
      },
    },
  },
  {
    name: "delete_work_item_attachment",
    description: "Delete an attachment from a work item",
    inputSchema: {
      type: "object",
      required: ["projectId", "workItemId", "attachmentId"],
      properties: {
        projectId: { type: "number" },
        workItemId: { type: "number" },
        attachmentId: { type: "number" },
      },
    },
  },

  // ── User management ───────────────────────────────────────────────────────
  {
    name: "add_project_user",
    description: "Add a user to a project",
    inputSchema: {
      type: "object",
      required: ["projectId", "userId"],
      properties: {
        projectId: { type: "number" },
        userId: { type: "number" },
        roleId: { type: "number", description: "Role to assign to the user" },
        isAdmin: { type: "boolean" },
      },
    },
  },
  {
    name: "update_project_user",
    description: "Partially update a user's project membership (PATCH)",
    inputSchema: {
      type: "object",
      required: ["projectId", "userId"],
      properties: {
        projectId: { type: "number" },
        userId: { type: "number" },
        roleId: { type: "number" },
        isAdmin: { type: "boolean" },
        isActive: { type: "boolean" },
      },
    },
  },
  {
    name: "replace_project_user",
    description: "Full replacement of a user's project membership (PUT)",
    inputSchema: {
      type: "object",
      required: ["projectId", "userId"],
      properties: {
        projectId: { type: "number" },
        userId: { type: "number" },
        roleId: { type: "number" },
        isAdmin: { type: "boolean" },
        isActive: { type: "boolean" },
      },
    },
  },
  {
    name: "add_team_to_project",
    description: "Add an entire team to a project",
    inputSchema: {
      type: "object",
      required: ["projectId", "teamId"],
      properties: {
        projectId: { type: "number" },
        teamId: { type: "number" },
        roleId: { type: "number" },
      },
    },
  },

  // ── Project Roles ─────────────────────────────────────────────────────────
  {
    name: "list_project_roles",
    description: "List all roles in a project",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number" },
      },
    },
  },
  {
    name: "create_project_role",
    description: "Create a new role in a project",
    inputSchema: {
      type: "object",
      required: ["projectId", "name"],
      properties: {
        projectId: { type: "number" },
        name: { type: "string" },
        description: { type: "string" },
      },
    },
  },
  {
    name: "get_project_role",
    description: "Get details of a specific project role",
    inputSchema: {
      type: "object",
      required: ["projectId", "roleId"],
      properties: {
        projectId: { type: "number" },
        roleId: { type: "number" },
      },
    },
  },
  {
    name: "update_project_role",
    description: "Partially update a project role (PATCH)",
    inputSchema: {
      type: "object",
      required: ["projectId", "roleId"],
      properties: {
        projectId: { type: "number" },
        roleId: { type: "number" },
        name: { type: "string" },
        description: { type: "string" },
      },
    },
  },
  {
    name: "replace_project_role",
    description: "Full replacement of a project role (PUT)",
    inputSchema: {
      type: "object",
      required: ["projectId", "roleId", "name"],
      properties: {
        projectId: { type: "number" },
        roleId: { type: "number" },
        name: { type: "string" },
        description: { type: "string" },
      },
    },
  },
  {
    name: "delete_project_role",
    description: "Delete a project role",
    inputSchema: {
      type: "object",
      required: ["projectId", "roleId"],
      properties: {
        projectId: { type: "number" },
        roleId: { type: "number" },
      },
    },
  },

  // ── Project Tags ──────────────────────────────────────────────────────────
  {
    name: "list_project_tags",
    description: "List all tags in a project",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number" },
      },
    },
  },
  {
    name: "create_project_tag",
    description: "Create a new tag in a project",
    inputSchema: {
      type: "object",
      required: ["projectId", "name"],
      properties: {
        projectId: { type: "number" },
        name: { type: "string" },
        color: { type: "string", description: "Hex color code (e.g. '#FF0000')" },
      },
    },
  },
  {
    name: "update_project_tag",
    description: "Partially update a project tag (PATCH)",
    inputSchema: {
      type: "object",
      required: ["projectId", "tagId"],
      properties: {
        projectId: { type: "number" },
        tagId: { type: "number" },
        name: { type: "string" },
        color: { type: "string" },
      },
    },
  },
  {
    name: "replace_project_tag",
    description: "Full replacement of a project tag (PUT)",
    inputSchema: {
      type: "object",
      required: ["projectId", "tagId", "name"],
      properties: {
        projectId: { type: "number" },
        tagId: { type: "number" },
        name: { type: "string" },
        color: { type: "string" },
      },
    },
  },
  {
    name: "delete_project_tag",
    description: "Delete a project tag",
    inputSchema: {
      type: "object",
      required: ["projectId", "tagId"],
      properties: {
        projectId: { type: "number" },
        tagId: { type: "number" },
      },
    },
  },

  // ── Design Elements ───────────────────────────────────────────────────────
  {
    name: "list_design_elements",
    description: "List design elements (GDD documents) in a project",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number" },
        typeId: { type: "number", description: "Filter by design element type" },
        limit: { type: "number" },
        offset: { type: "number" },
      },
    },
  },
  {
    name: "create_design_element",
    description: "Create a new design element (GDD document) in a project",
    inputSchema: {
      type: "object",
      required: ["projectId", "name", "typeId"],
      properties: {
        projectId: { type: "number" },
        name: { type: "string" },
        typeId: { type: "number", description: "Design element type ID (use list_design_element_types)" },
        description: { type: "string" },
        startDate: { type: "string", description: "ISO 8601 date string" },
        endDate: { type: "string", description: "ISO 8601 date string" },
      },
    },
  },
  {
    name: "get_design_element",
    description: "Get details of a specific design element",
    inputSchema: {
      type: "object",
      required: ["projectId", "designElementId"],
      properties: {
        projectId: { type: "number" },
        designElementId: { type: "number" },
      },
    },
  },
  {
    name: "update_design_element",
    description: "Partially update a design element (PATCH)",
    inputSchema: {
      type: "object",
      required: ["projectId", "designElementId"],
      properties: {
        projectId: { type: "number" },
        designElementId: { type: "number" },
        name: { type: "string" },
        description: { type: "string" },
        typeId: { type: "number" },
        startDate: { type: "string" },
        endDate: { type: "string" },
      },
    },
  },
  {
    name: "replace_design_element",
    description: "Full replacement of a design element (PUT)",
    inputSchema: {
      type: "object",
      required: ["projectId", "designElementId", "name", "typeId"],
      properties: {
        projectId: { type: "number" },
        designElementId: { type: "number" },
        name: { type: "string" },
        typeId: { type: "number" },
        description: { type: "string" },
        startDate: { type: "string" },
        endDate: { type: "string" },
      },
    },
  },
  {
    name: "delete_design_element",
    description: "Delete a design element",
    inputSchema: {
      type: "object",
      required: ["projectId", "designElementId"],
      properties: {
        projectId: { type: "number" },
        designElementId: { type: "number" },
      },
    },
  },
  {
    name: "get_design_element_metrics",
    description: "Get metrics for a design element",
    inputSchema: {
      type: "object",
      required: ["projectId", "designElementId"],
      properties: {
        projectId: { type: "number" },
        designElementId: { type: "number" },
      },
    },
  },

  // ── Design Element Attachments ────────────────────────────────────────────
  {
    name: "list_design_element_attachments",
    description: "List attachments on a design element",
    inputSchema: {
      type: "object",
      required: ["projectId", "designElementId"],
      properties: {
        projectId: { type: "number" },
        designElementId: { type: "number" },
      },
    },
  },
  {
    name: "get_design_element_attachment",
    description: "Get a specific attachment on a design element",
    inputSchema: {
      type: "object",
      required: ["projectId", "designElementId", "attachmentId"],
      properties: {
        projectId: { type: "number" },
        designElementId: { type: "number" },
        attachmentId: { type: "number" },
      },
    },
  },
  {
    name: "delete_design_element_attachment",
    description: "Delete an attachment from a design element",
    inputSchema: {
      type: "object",
      required: ["projectId", "designElementId", "attachmentId"],
      properties: {
        projectId: { type: "number" },
        designElementId: { type: "number" },
        attachmentId: { type: "number" },
      },
    },
  },

  // ── Design Element Comments ───────────────────────────────────────────────
  {
    name: "list_design_element_comments",
    description: "List comments on a design element",
    inputSchema: {
      type: "object",
      required: ["projectId", "designElementId"],
      properties: {
        projectId: { type: "number" },
        designElementId: { type: "number" },
      },
    },
  },
  {
    name: "create_design_element_comment",
    description: "Add a comment to a design element",
    inputSchema: {
      type: "object",
      required: ["projectId", "designElementId", "text"],
      properties: {
        projectId: { type: "number" },
        designElementId: { type: "number" },
        text: { type: "string" },
      },
    },
  },
  {
    name: "update_design_element_comment",
    description: "Update a comment on a design element (PUT — replaces content)",
    inputSchema: {
      type: "object",
      required: ["projectId", "designElementId", "commentId", "text"],
      properties: {
        projectId: { type: "number" },
        designElementId: { type: "number" },
        commentId: { type: "number" },
        text: { type: "string" },
      },
    },
  },
  {
    name: "delete_design_element_comment",
    description: "Delete a comment from a design element",
    inputSchema: {
      type: "object",
      required: ["projectId", "designElementId", "commentId"],
      properties: {
        projectId: { type: "number" },
        designElementId: { type: "number" },
        commentId: { type: "number" },
      },
    },
  },

  // ── Design Element Types ──────────────────────────────────────────────────
  {
    name: "list_design_element_types",
    description: "List design element types in a project (used as typeId when creating design elements)",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number" },
      },
    },
  },
  {
    name: "create_design_element_type",
    description: "Create a new design element type in a project",
    inputSchema: {
      type: "object",
      required: ["projectId", "name"],
      properties: {
        projectId: { type: "number" },
        name: { type: "string" },
        description: { type: "string" },
      },
    },
  },
  {
    name: "get_design_element_type",
    description: "Get details of a specific design element type",
    inputSchema: {
      type: "object",
      required: ["projectId", "designElementTypeId"],
      properties: {
        projectId: { type: "number" },
        designElementTypeId: { type: "number" },
      },
    },
  },
  {
    name: "update_design_element_type",
    description: "Partially update a design element type (PATCH)",
    inputSchema: {
      type: "object",
      required: ["projectId", "designElementTypeId"],
      properties: {
        projectId: { type: "number" },
        designElementTypeId: { type: "number" },
        name: { type: "string" },
        description: { type: "string" },
      },
    },
  },
  {
    name: "replace_design_element_type",
    description: "Full replacement of a design element type (PUT)",
    inputSchema: {
      type: "object",
      required: ["projectId", "designElementTypeId", "name"],
      properties: {
        projectId: { type: "number" },
        designElementTypeId: { type: "number" },
        name: { type: "string" },
        description: { type: "string" },
      },
    },
  },
  {
    name: "delete_design_element_type",
    description: "Delete a design element type",
    inputSchema: {
      type: "object",
      required: ["projectId", "designElementTypeId"],
      properties: {
        projectId: { type: "number" },
        designElementTypeId: { type: "number" },
      },
    },
  },

  // ── Events & Files ────────────────────────────────────────────────────────
  {
    name: "list_project_events",
    description: "List activity events for a project",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number" },
        limit: { type: "number" },
        offset: { type: "number" },
      },
    },
  },
  {
    name: "list_project_files",
    description: "List files stored in a project",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number" },
      },
    },
  },
  {
    name: "delete_project_file",
    description: "Delete a file from a project",
    inputSchema: {
      type: "object",
      required: ["projectId", "fileId"],
      properties: {
        projectId: { type: "number" },
        fileId: { type: "number" },
      },
    },
  },
  {
    name: "get_project_storage",
    description: "Get file storage quota and usage for a project",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number" },
      },
    },
  },

  // ── Webhooks ──────────────────────────────────────────────────────────────
  {
    name: "list_webhook_event_types",
    description: "List all available webhook event types",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_webhooks",
    description: "List all webhooks configured for a project",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number" },
      },
    },
  },
  {
    name: "create_webhook",
    description: "Create a new webhook for a project",
    inputSchema: {
      type: "object",
      required: ["projectId", "url", "events"],
      properties: {
        projectId: { type: "number" },
        url: { type: "string", description: "HTTPS endpoint to receive webhook payloads" },
        events: {
          type: "array",
          items: { type: "string" },
          description: "Event types to subscribe to (use list_webhook_event_types)",
        },
        secret: { type: "string", description: "Optional secret for payload signature verification" },
      },
    },
  },
  {
    name: "get_webhook",
    description: "Get details of a specific webhook",
    inputSchema: {
      type: "object",
      required: ["projectId", "webhookId"],
      properties: {
        projectId: { type: "number" },
        webhookId: { type: "number" },
      },
    },
  },
  {
    name: "update_webhook",
    description: "Partially update a webhook (PATCH)",
    inputSchema: {
      type: "object",
      required: ["projectId", "webhookId"],
      properties: {
        projectId: { type: "number" },
        webhookId: { type: "number" },
        url: { type: "string" },
        events: { type: "array", items: { type: "string" } },
        secret: { type: "string" },
      },
    },
  },
  {
    name: "replace_webhook",
    description: "Full replacement of a webhook (PUT)",
    inputSchema: {
      type: "object",
      required: ["projectId", "webhookId", "url", "events"],
      properties: {
        projectId: { type: "number" },
        webhookId: { type: "number" },
        url: { type: "string" },
        events: { type: "array", items: { type: "string" } },
        secret: { type: "string" },
      },
    },
  },
  {
    name: "delete_webhook",
    description: "Delete a webhook",
    inputSchema: {
      type: "object",
      required: ["projectId", "webhookId"],
      properties: {
        projectId: { type: "number" },
        webhookId: { type: "number" },
      },
    },
  },
];

export async function handleTool(name, args) {
  switch (name) {
    // ── Projects ────────────────────────────────────────────────────────────
    case "list_projects": {
      const q = new URLSearchParams();
      if (args.limit) q.set("limit", args.limit);
      if (args.offset) q.set("offset", args.offset);
      return hnpRequest(`/projects?${q}`);
    }
    case "get_project":
      return hnpRequest(`/projects/${args.projectId}`);
    case "create_project":
      return hnpRequest("/projects", "POST", {
        name: args.name,
        description: args.description,
        costMetric: args.costMetric,
      });
    case "update_project": {
      const { projectId, ...body } = args;
      return hnpRequest(`/projects/${projectId}`, "PATCH", body);
    }
    case "delete_project":
      return hnpRequest(`/projects/${args.projectId}`, "DELETE");
    case "close_project":
      return hnpRequest(`/projects/${args.projectId}/closure`, "POST");
    case "reopen_project":
      return hnpRequest(`/projects/${args.projectId}/closure`, "DELETE");
    case "get_project_metrics":
      return hnpRequest(`/projects/${args.projectId}/metrics`);
    case "change_project_owner":
      return hnpRequest(`/projects/${args.projectId}/owner`, "PUT", { userId: args.userId });

    // ── Boards ──────────────────────────────────────────────────────────────
    case "list_boards": {
      const q = new URLSearchParams();
      if (args.includeClosed !== undefined) q.set("includeClosed", args.includeClosed);
      const qs = q.toString() ? `?${q}` : "";
      return hnpRequest(`/projects/${args.projectId}/boards${qs}`);
    }
    case "get_board":
      return hnpRequest(`/projects/${args.projectId}/boards/${args.boardId}`);
    case "create_board": {
      const { projectId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/boards`, "POST", body);
    }
    case "update_board": {
      const { projectId, boardId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/boards/${boardId}`, "PATCH", body);
    }
    case "delete_board": {
      const q = new URLSearchParams();
      if (args.removeWorkItems !== undefined) q.set("removeWorkItems", args.removeWorkItems);
      const qs = q.toString() ? `?${q}` : "";
      return hnpRequest(`/projects/${args.projectId}/boards/${args.boardId}${qs}`, "DELETE");
    }
    case "close_board":
      // API requires a JSON body (even empty) when Content-Type: application/json is set
      return hnpRequest(`/projects/${args.projectId}/boards/${args.boardId}/closure`, "POST", {});
    case "reopen_board":
      return hnpRequest(`/projects/${args.projectId}/boards/${args.boardId}/closure`, "DELETE");
    case "get_board_metrics":
      return hnpRequest(`/projects/${args.projectId}/boards/${args.boardId}/metrics`);

    // ── Milestones ──────────────────────────────────────────────────────────
    case "list_milestones":
      return hnpRequest(`/projects/${args.projectId}/milestones`);
    case "get_milestone": {
      const q = new URLSearchParams();
      if (args.includeBoards !== undefined) q.set("includeBoards", args.includeBoards);
      const qs = q.toString() ? `?${q}` : "";
      return hnpRequest(`/projects/${args.projectId}/milestones/${args.milestoneId}${qs}`);
    }
    case "create_milestone": {
      const { projectId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/milestones`, "POST", body);
    }
    case "update_milestone": {
      const { projectId, milestoneId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/milestones/${milestoneId}`, "PATCH", body);
    }
    case "delete_milestone": {
      const q = new URLSearchParams();
      if (args.deleteBoards !== undefined) q.set("deleteBoards", args.deleteBoards);
      if (args.deleteWorkItems !== undefined) q.set("deleteWorkItems", args.deleteWorkItems);
      const qs = q.toString() ? `?${q}` : "";
      return hnpRequest(`/projects/${args.projectId}/milestones/${args.milestoneId}${qs}`, "DELETE");
    }
    case "close_milestone":
      // API requires a JSON body (even empty) when Content-Type: application/json is set
      return hnpRequest(
        `/projects/${args.projectId}/milestones/${args.milestoneId}/closure`,
        "POST",
        {}
      );
    case "reopen_milestone":
      return hnpRequest(
        `/projects/${args.projectId}/milestones/${args.milestoneId}/closure`,
        "DELETE"
      );
    case "get_milestone_metrics":
      return hnpRequest(`/projects/${args.projectId}/milestones/${args.milestoneId}/metrics`);

    // ── Work Items ──────────────────────────────────────────────────────────
    case "list_work_items": {
      const { projectId, ...filters } = args;
      const q = new URLSearchParams();
      for (const [k, v] of Object.entries(filters)) {
        if (v !== undefined) q.set(k, v);
      }
      if (!q.has("limit")) q.set("limit", "20");
      return hnpRequest(`/projects/${projectId}/workitems?${q}`);
    }
    case "get_work_item":
      return hnpRequest(`/projects/${args.projectId}/workitems/${args.workItemId}`);
    case "create_work_item": {
      const { projectId, boardId, stageId, ...body } = args;
      if (!body.importanceLevelId) body.importanceLevelId = 3;
      const item = await hnpRequest(
        `/projects/${projectId}/workitems?boardId=${boardId}`,
        "POST",
        body
      );
      if (stageId) {
        return hnpRequest(`/projects/${projectId}/workitems/${item.workItemId}`, "PATCH", {
          stageId,
        });
      }
      return item;
    }
    case "update_work_item": {
      const { projectId, workItemId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/workitems/${workItemId}`, "PATCH", body);
    }
    case "clone_work_item": {
      const { projectId, workItemId, boardId } = args;
      const qs = boardId ? `?boardId=${boardId}` : "";
      return hnpRequest(`/projects/${projectId}/workitems/${workItemId}${qs}`, "POST");
    }
    case "delete_work_item":
      return hnpRequest(`/projects/${args.projectId}/workitems/${args.workItemId}`, "DELETE");

    // ── Categories ──────────────────────────────────────────────────────────
    case "list_categories":
      return hnpRequest(`/projects/${args.projectId}/categories`);
    case "create_category": {
      const { projectId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/categories`, "POST", body);
    }
    case "get_category":
      return hnpRequest(`/projects/${args.projectId}/categories/${args.categoryId}`);
    case "update_category": {
      const { projectId, categoryId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/categories/${categoryId}`, "PATCH", body);
    }
    case "delete_category":
      return hnpRequest(`/projects/${args.projectId}/categories/${args.categoryId}`, "DELETE");

    // ── Stages ──────────────────────────────────────────────────────────────
    case "list_stages":
      return hnpRequest(`/projects/${args.projectId}/stages`);
    case "create_stage": {
      const { projectId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/stages`, "POST", body);
    }
    case "get_stage":
      return hnpRequest(`/projects/${args.projectId}/stages/${args.stageId}`);
    case "update_stage": {
      const { projectId, stageId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/stages/${stageId}`, "PATCH", body);
    }
    case "delete_stage":
      return hnpRequest(`/projects/${args.projectId}/stages/${args.stageId}`, "DELETE");

    // ── Importance Levels ────────────────────────────────────────────────────
    case "list_importance_levels":
      return hnpRequest(`/projects/${args.projectId}/importancelevels`);
    case "create_importance_level": {
      const { projectId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/importancelevels`, "POST", body);
    }
    case "get_importance_level":
      return hnpRequest(
        `/projects/${args.projectId}/importancelevels/${args.importanceLevelId}`
      );
    case "update_importance_level": {
      const { projectId, importanceLevelId, ...body } = args;
      return hnpRequest(
        `/projects/${projectId}/importancelevels/${importanceLevelId}`,
        "PATCH",
        body
      );
    }
    case "delete_importance_level":
      return hnpRequest(
        `/projects/${args.projectId}/importancelevels/${args.importanceLevelId}`,
        "DELETE"
      );

    // ── Users ────────────────────────────────────────────────────────────────
    case "list_project_users":
      return hnpRequest(`/projects/${args.projectId}/users`);
    case "get_project_user":
      return hnpRequest(`/projects/${args.projectId}/users/${args.userId}`);
    case "get_current_user":
      return hnpRequest("/users/me");

    // ── Full-replace (PUT) variants ──────────────────────────────────────────
    case "replace_project": {
      const { projectId, ...body } = args;
      return hnpRequest(`/projects/${projectId}`, "PUT", body);
    }
    case "replace_board": {
      const { projectId, boardId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/boards/${boardId}`, "PUT", body);
    }
    case "replace_milestone": {
      const { projectId, milestoneId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/milestones/${milestoneId}`, "PUT", body);
    }

    // ── Default board ────────────────────────────────────────────────────────
    case "set_default_board":
      return hnpRequest(`/projects/${args.projectId}/boards/default`, "POST", { boardId: args.boardId });
    case "clear_default_board":
      return hnpRequest(`/projects/${args.projectId}/boards/default`, "DELETE");

    // ── Work Item Attachments ────────────────────────────────────────────────
    case "list_work_item_attachments":
      return hnpRequest(`/projects/${args.projectId}/workitems/${args.workItemId}/attachments`);
    case "get_work_item_attachment":
      return hnpRequest(`/projects/${args.projectId}/workitems/${args.workItemId}/attachments/${args.attachmentId}`);
    case "delete_work_item_attachment":
      return hnpRequest(`/projects/${args.projectId}/workitems/${args.workItemId}/attachments/${args.attachmentId}`, "DELETE");

    // ── User management ──────────────────────────────────────────────────────
    case "add_project_user": {
      const { projectId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/users`, "POST", body);
    }
    case "update_project_user": {
      const { projectId, userId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/users/${userId}`, "PATCH", body);
    }
    case "replace_project_user": {
      const { projectId, userId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/users/${userId}`, "PUT", body);
    }
    case "add_team_to_project": {
      const { projectId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/teams`, "POST", body);
    }

    // ── Project Roles ────────────────────────────────────────────────────────
    case "list_project_roles":
      return hnpRequest(`/projects/${args.projectId}/roles`);
    case "create_project_role": {
      const { projectId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/roles`, "POST", body);
    }
    case "get_project_role":
      return hnpRequest(`/projects/${args.projectId}/roles/${args.roleId}`);
    case "update_project_role": {
      const { projectId, roleId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/roles/${roleId}`, "PATCH", body);
    }
    case "replace_project_role": {
      const { projectId, roleId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/roles/${roleId}`, "PUT", body);
    }
    case "delete_project_role":
      return hnpRequest(`/projects/${args.projectId}/roles/${args.roleId}`, "DELETE");

    // ── Project Tags ─────────────────────────────────────────────────────────
    case "list_project_tags":
      return hnpRequest(`/projects/${args.projectId}/tags`);
    case "create_project_tag": {
      const { projectId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/tags`, "POST", body);
    }
    case "update_project_tag": {
      const { projectId, tagId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/tags/${tagId}`, "PATCH", body);
    }
    case "replace_project_tag": {
      const { projectId, tagId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/tags/${tagId}`, "PUT", body);
    }
    case "delete_project_tag":
      return hnpRequest(`/projects/${args.projectId}/tags/${args.tagId}`, "DELETE");

    // ── Design Elements ──────────────────────────────────────────────────────
    case "list_design_elements": {
      const { projectId, ...filters } = args;
      const q = new URLSearchParams();
      for (const [k, v] of Object.entries(filters)) {
        if (v !== undefined) q.set(k, v);
      }
      const qs = q.toString() ? `?${q}` : "";
      return hnpRequest(`/projects/${projectId}/designelements${qs}`);
    }
    case "create_design_element": {
      const { projectId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/designelements`, "POST", body);
    }
    case "get_design_element":
      return hnpRequest(`/projects/${args.projectId}/designelements/${args.designElementId}`);
    case "update_design_element": {
      const { projectId, designElementId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/designelements/${designElementId}`, "PATCH", body);
    }
    case "replace_design_element": {
      const { projectId, designElementId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/designelements/${designElementId}`, "PUT", body);
    }
    case "delete_design_element":
      return hnpRequest(`/projects/${args.projectId}/designelements/${args.designElementId}`, "DELETE");
    case "get_design_element_metrics":
      return hnpRequest(`/projects/${args.projectId}/designelements/${args.designElementId}/metrics`);

    // ── Design Element Attachments ───────────────────────────────────────────
    case "list_design_element_attachments":
      return hnpRequest(`/projects/${args.projectId}/designelements/${args.designElementId}/attachments`);
    case "get_design_element_attachment":
      return hnpRequest(`/projects/${args.projectId}/designelements/${args.designElementId}/attachments/${args.attachmentId}`);
    case "delete_design_element_attachment":
      return hnpRequest(`/projects/${args.projectId}/designelements/${args.designElementId}/attachments/${args.attachmentId}`, "DELETE");

    // ── Design Element Comments ──────────────────────────────────────────────
    case "list_design_element_comments":
      return hnpRequest(`/projects/${args.projectId}/designelements/${args.designElementId}/comments`);
    case "create_design_element_comment": {
      const { projectId, designElementId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/designelements/${designElementId}/comments`, "POST", body);
    }
    case "update_design_element_comment": {
      const { projectId, designElementId, commentId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/designelements/${designElementId}/comments/${commentId}`, "PUT", body);
    }
    case "delete_design_element_comment":
      return hnpRequest(`/projects/${args.projectId}/designelements/${args.designElementId}/comments/${args.commentId}`, "DELETE");

    // ── Design Element Types ─────────────────────────────────────────────────
    case "list_design_element_types":
      return hnpRequest(`/projects/${args.projectId}/designelementtypes`);
    case "create_design_element_type": {
      const { projectId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/designelementtypes`, "POST", body);
    }
    case "get_design_element_type":
      return hnpRequest(`/projects/${args.projectId}/designelementtypes/${args.designElementTypeId}`);
    case "update_design_element_type": {
      const { projectId, designElementTypeId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/designelementtypes/${designElementTypeId}`, "PATCH", body);
    }
    case "replace_design_element_type": {
      const { projectId, designElementTypeId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/designelementtypes/${designElementTypeId}`, "PUT", body);
    }
    case "delete_design_element_type":
      return hnpRequest(`/projects/${args.projectId}/designelementtypes/${args.designElementTypeId}`, "DELETE");

    // ── Events & Files ───────────────────────────────────────────────────────
    case "list_project_events": {
      const q = new URLSearchParams();
      if (args.limit) q.set("limit", args.limit);
      if (args.offset) q.set("offset", args.offset);
      const qs = q.toString() ? `?${q}` : "";
      return hnpRequest(`/projects/${args.projectId}/events${qs}`);
    }
    case "list_project_files":
      return hnpRequest(`/projects/${args.projectId}/files`);
    case "delete_project_file":
      return hnpRequest(`/projects/${args.projectId}/files/${args.fileId}`, "DELETE");
    case "get_project_storage":
      return hnpRequest(`/projects/${args.projectId}/storage`);

    // ── Webhooks ─────────────────────────────────────────────────────────────
    case "list_webhook_event_types":
      return hnpRequest("/webhookevents");
    case "list_webhooks":
      return hnpRequest(`/projects/${args.projectId}/webhooks`);
    case "create_webhook": {
      const { projectId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/webhooks`, "POST", body);
    }
    case "get_webhook":
      return hnpRequest(`/projects/${args.projectId}/webhooks/${args.webhookId}`);
    case "update_webhook": {
      const { projectId, webhookId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/webhooks/${webhookId}`, "PATCH", body);
    }
    case "replace_webhook": {
      const { projectId, webhookId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/webhooks/${webhookId}`, "PUT", body);
    }
    case "delete_webhook":
      return hnpRequest(`/projects/${args.projectId}/webhooks/${args.webhookId}`, "DELETE");

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

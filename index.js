#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const BASE_URL = "https://api.hacknplan.com/v0";
const API_KEY = process.env.HACKNPLAN_API_KEY;

if (!API_KEY) {
  console.error("Error: HACKNPLAN_API_KEY environment variable is required");
  process.exit(1);
}

async function hnpRequest(path, method = "GET", body = null) {
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
  return res.json();
}

const TOOLS = [
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
      required: ["name"],
      properties: {
        name: { type: "string" },
        description: { type: "string" },
      },
    },
  },
  {
    name: "update_project",
    description: "Update a project's name or description",
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
  // ── Boards ────────────────────────────────────────────────────────────────
  {
    name: "list_boards",
    description: "List all boards in a project",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number" },
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
    name: "close_milestone",
    description: "Close (complete) a milestone",
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
    description: "Reopen a closed milestone",
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
    description: "List work items in a project, optionally filtered by board or stage",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "number" },
        boardId: { type: "number" },
        stageId: { type: "number" },
        categoryId: { type: "number" },
        assignedUserId: { type: "number" },
        isCompleted: { type: "boolean" },
        limit: { type: "number", description: "Max results (default 20, max 100)" },
        offset: { type: "number" },
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
        priorityId: {
          type: "number",
          description: "Priority: 0=None, 1=Low, 2=Medium, 3=High, 4=Critical",
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
        priorityId: { type: "number" },
        isCompleted: { type: "boolean" },
      },
    },
  },
  {
    name: "delete_work_item",
    description: "Delete a work item permanently",
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
    name: "get_current_user",
    description: "Get information about the currently authenticated user",
    inputSchema: { type: "object", properties: {} },
  },
];

async function handleTool(name, args) {
  switch (name) {
    // Projects
    case "list_projects": {
      const q = new URLSearchParams();
      if (args.limit) q.set("limit", args.limit);
      if (args.offset) q.set("offset", args.offset);
      return hnpRequest(`/projects?${q}`);
    }
    case "get_project":
      return hnpRequest(`/projects/${args.projectId}`);
    case "create_project":
      return hnpRequest("/projects", "POST", { name: args.name, description: args.description });
    case "update_project": {
      const { projectId, ...body } = args;
      return hnpRequest(`/projects/${projectId}`, "PATCH", body);
    }

    // Boards
    case "list_boards":
      return hnpRequest(`/projects/${args.projectId}/boards`);
    case "get_board":
      return hnpRequest(`/projects/${args.projectId}/boards/${args.boardId}`);
    case "create_board": {
      const { projectId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/boards`, "POST", body);
    }

    // Milestones
    case "list_milestones":
      return hnpRequest(`/projects/${args.projectId}/milestones`);
    case "get_milestone":
      return hnpRequest(`/projects/${args.projectId}/milestones/${args.milestoneId}`);
    case "create_milestone": {
      const { projectId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/milestones`, "POST", body);
    }
    case "close_milestone":
      return hnpRequest(
        `/projects/${args.projectId}/milestones/${args.milestoneId}/close`,
        "POST"
      );
    case "reopen_milestone":
      return hnpRequest(
        `/projects/${args.projectId}/milestones/${args.milestoneId}/reopen`,
        "POST"
      );

    // Work Items
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
      const { projectId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/workitems`, "POST", body);
    }
    case "update_work_item": {
      const { projectId, workItemId, ...body } = args;
      return hnpRequest(`/projects/${projectId}/workitems/${workItemId}`, "PATCH", body);
    }
    case "delete_work_item":
      return hnpRequest(
        `/projects/${args.projectId}/workitems/${args.workItemId}`,
        "DELETE"
      );

    // Categories
    case "list_categories":
      return hnpRequest(`/projects/${args.projectId}/categories`);

    // Stages
    case "list_stages":
      return hnpRequest(`/projects/${args.projectId}/stages`);

    // Users
    case "list_project_users":
      return hnpRequest(`/projects/${args.projectId}/users`);
    case "get_current_user":
      return hnpRequest("/users/me");

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

const server = new Server(
  { name: "hacknplan-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    const result = await handleTool(name, args || {});
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    return {
      content: [{ type: "text", text: `Error: ${err.message}` }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);

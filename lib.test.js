import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

process.env.HACKNPLAN_API_KEY = "test-api-key";

const { handleTool } = await import("./lib.js");

// ── Helpers ───────────────────────────────────────────────────────────────────

let lastRequest;

function mockFetch(responseOverride = {}) {
  globalThis.fetch = async (url, opts) => {
    lastRequest = { url, opts };
    return {
      ok: true,
      status: 200,
      json: async () => responseOverride.json ?? { id: 1 },
      text: async () => responseOverride.text ?? "",
      ...responseOverride,
    };
  };
}

function mock204() {
  mockFetch({ ok: true, status: 204, json: async () => null, text: async () => "" });
}

function lastBody() {
  return JSON.parse(lastRequest.opts.body);
}

function lastURL() {
  return new URL(lastRequest.url);
}

// ── Projects ──────────────────────────────────────────────────────────────────

describe("list_projects", () => {
  beforeEach(() => mockFetch());

  it("sends GET to /projects", async () => {
    await handleTool("list_projects", {});
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects");
  });

  it("forwards limit and offset as query params", async () => {
    await handleTool("list_projects", { limit: 10, offset: 20 });
    const p = lastURL().searchParams;
    assert.equal(p.get("limit"), "10");
    assert.equal(p.get("offset"), "20");
  });

  it("omits query params when not provided", async () => {
    await handleTool("list_projects", {});
    const p = lastURL().searchParams;
    assert.equal(p.get("limit"), null);
    assert.equal(p.get("offset"), null);
  });
});

describe("get_project", () => {
  beforeEach(() => mockFetch());

  it("sends GET to /projects/{projectId}", async () => {
    await handleTool("get_project", { projectId: 42 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42");
  });
});

describe("create_project", () => {
  beforeEach(() => mockFetch());

  it("sends POST to /projects", async () => {
    await handleTool("create_project", { name: "My Game", costMetric: "points" });
    assert.equal(lastRequest.opts.method, "POST");
    assert.equal(lastURL().pathname, "/v0/projects");
  });

  it("sends name, costMetric and description in body", async () => {
    await handleTool("create_project", { name: "My Game", costMetric: "hours", description: "A fun game" });
    const body = lastBody();
    assert.equal(body.name, "My Game");
    assert.equal(body.costMetric, "hours");
    assert.equal(body.description, "A fun game");
  });

  it("sends costMetric in body", async () => {
    await handleTool("create_project", { name: "My Game", costMetric: "points" });
    assert.equal(lastBody().costMetric, "points");
  });
});

describe("update_project", () => {
  beforeEach(() => mockFetch());

  it("sends PATCH to /projects/{projectId}", async () => {
    await handleTool("update_project", { projectId: 42, name: "New Name" });
    assert.equal(lastRequest.opts.method, "PATCH");
    assert.equal(lastURL().pathname, "/v0/projects/42");
  });

  it("does not include projectId in body", async () => {
    await handleTool("update_project", { projectId: 42, name: "New Name" });
    const body = lastBody();
    assert.equal(body.projectId, undefined);
    assert.equal(body.name, "New Name");
  });
});

// ── Boards ────────────────────────────────────────────────────────────────────

describe("list_boards", () => {
  beforeEach(() => mockFetch());

  it("sends GET to /projects/{projectId}/boards", async () => {
    await handleTool("list_boards", { projectId: 42 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/boards");
  });
});

describe("get_board", () => {
  beforeEach(() => mockFetch());

  it("sends GET to /projects/{projectId}/boards/{boardId}", async () => {
    await handleTool("get_board", { projectId: 42, boardId: 7 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/boards/7");
  });
});

describe("create_board", () => {
  beforeEach(() => mockFetch());

  it("sends POST to /projects/{projectId}/boards", async () => {
    await handleTool("create_board", { projectId: 42, name: "Art" });
    assert.equal(lastRequest.opts.method, "POST");
    assert.equal(lastURL().pathname, "/v0/projects/42/boards");
  });

  it("sends name in body", async () => {
    await handleTool("create_board", { projectId: 42, name: "Art" });
    assert.equal(lastBody().name, "Art");
  });

  it("sends optional milestoneId in body", async () => {
    await handleTool("create_board", { projectId: 42, name: "Art", milestoneId: 5 });
    assert.equal(lastBody().milestoneId, 5);
  });

  it("does not include projectId in body", async () => {
    await handleTool("create_board", { projectId: 42, name: "Art" });
    assert.equal(lastBody().projectId, undefined);
  });
});

// ── Milestones ────────────────────────────────────────────────────────────────

describe("list_milestones", () => {
  beforeEach(() => mockFetch());

  it("sends GET to /projects/{projectId}/milestones", async () => {
    await handleTool("list_milestones", { projectId: 42 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/milestones");
  });
});

describe("get_milestone", () => {
  beforeEach(() => mockFetch());

  it("sends GET to /projects/{projectId}/milestones/{milestoneId}", async () => {
    await handleTool("get_milestone", { projectId: 42, milestoneId: 3 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/milestones/3");
  });
});

describe("create_milestone", () => {
  beforeEach(() => mockFetch());

  it("sends POST to /projects/{projectId}/milestones", async () => {
    await handleTool("create_milestone", { projectId: 42, name: "Alpha" });
    assert.equal(lastRequest.opts.method, "POST");
    assert.equal(lastURL().pathname, "/v0/projects/42/milestones");
  });

  it("sends name in body", async () => {
    await handleTool("create_milestone", { projectId: 42, name: "Alpha" });
    assert.equal(lastBody().name, "Alpha");
  });

  it("forwards optional fields in body", async () => {
    await handleTool("create_milestone", {
      projectId: 42,
      name: "Alpha",
      description: "First release",
      startDate: "2026-04-01",
      endDate: "2026-06-30",
    });
    const body = lastBody();
    assert.equal(body.description, "First release");
    assert.equal(body.startDate, "2026-04-01");
    assert.equal(body.endDate, "2026-06-30");
  });

  it("does not include projectId in body", async () => {
    await handleTool("create_milestone", { projectId: 42, name: "Alpha" });
    assert.equal(lastBody().projectId, undefined);
  });
});

describe("delete_milestone", () => {
  beforeEach(() => mock204());

  it("sends DELETE to /projects/{projectId}/milestones/{milestoneId}", async () => {
    await handleTool("delete_milestone", { projectId: 42, milestoneId: 3 });
    assert.equal(lastRequest.opts.method, "DELETE");
    assert.equal(lastURL().pathname, "/v0/projects/42/milestones/3");
  });

  it("returns null for 204 response", async () => {
    const result = await handleTool("delete_milestone", { projectId: 42, milestoneId: 3 });
    assert.equal(result, null);
  });
});

// ── Work Items ────────────────────────────────────────────────────────────────

describe("list_work_items", () => {
  beforeEach(() => mockFetch());

  it("sends GET to /projects/{projectId}/workitems", async () => {
    await handleTool("list_work_items", { projectId: 42 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/workitems");
  });

  it("defaults limit to 20", async () => {
    await handleTool("list_work_items", { projectId: 42 });
    assert.equal(lastURL().searchParams.get("limit"), "20");
  });

  it("forwards all filter query params", async () => {
    await handleTool("list_work_items", {
      projectId: 42,
      boardId: 7,
      stageId: 2,
      categoryId: 3,
      assignedUserId: 5,
      isCompleted: false,
      limit: 50,
      offset: 10,
    });
    const p = lastURL().searchParams;
    assert.equal(p.get("boardId"), "7");
    assert.equal(p.get("stageId"), "2");
    assert.equal(p.get("categoryId"), "3");
    assert.equal(p.get("assignedUserId"), "5");
    assert.equal(p.get("isCompleted"), "false");
    assert.equal(p.get("limit"), "50");
    assert.equal(p.get("offset"), "10");
  });

  it("does not include projectId as a query param", async () => {
    await handleTool("list_work_items", { projectId: 42 });
    assert.equal(lastURL().searchParams.get("projectId"), null);
  });
});

describe("get_work_item", () => {
  beforeEach(() => mockFetch());

  it("sends GET to /projects/{projectId}/workitems/{workItemId}", async () => {
    await handleTool("get_work_item", { projectId: 42, workItemId: 99 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/workitems/99");
  });
});

describe("create_work_item", () => {
  beforeEach(() => mockFetch());

  it("sends POST to /projects/{projectId}/workitems", async () => {
    await handleTool("create_work_item", { projectId: 42, boardId: 7, title: "Fix bug" });
    assert.equal(lastRequest.opts.method, "POST");
    assert.equal(lastURL().pathname, "/v0/projects/42/workitems");
  });

  it("sends boardId as a query param", async () => {
    await handleTool("create_work_item", { projectId: 42, boardId: 7, title: "Fix bug" });
    assert.equal(lastURL().searchParams.get("boardId"), "7");
  });

  it("does not include boardId in the request body", async () => {
    await handleTool("create_work_item", { projectId: 42, boardId: 7, title: "Fix bug" });
    assert.equal(lastBody().boardId, undefined);
  });

  it("puts title in the request body", async () => {
    await handleTool("create_work_item", { projectId: 42, boardId: 7, title: "Fix bug" });
    assert.equal(lastBody().title, "Fix bug");
  });

  it("defaults importanceLevelId to 3 when not provided", async () => {
    await handleTool("create_work_item", { projectId: 42, boardId: 7, title: "Task" });
    assert.equal(lastBody().importanceLevelId, 3);
  });

  it("uses provided importanceLevelId", async () => {
    await handleTool("create_work_item", { projectId: 42, boardId: 7, title: "Task", importanceLevelId: 1 });
    assert.equal(lastBody().importanceLevelId, 1);
  });

  it("forwards all optional fields in the POST body", async () => {
    const requests = [];
    globalThis.fetch = async (url, opts) => {
      requests.push({ url, opts });
      return { ok: true, status: 200, json: async () => ({ workItemId: 1 }) };
    };
    await handleTool("create_work_item", {
      projectId: 1,
      boardId: 2,
      title: "Task",
      description: "Details",
      isStory: true,
      parentStoryId: 5,
      categoryId: 3,
      stageId: 4,
      assignedUserId: 5,
      estimatedTime: 2,
      dueDate: "2026-04-01",
      tags: ["bug", "urgent"],
      importanceLevelId: 2,
    });
    const body = JSON.parse(requests[0].opts.body);
    assert.equal(body.description, "Details");
    assert.equal(body.isStory, true);
    assert.equal(body.parentStoryId, 5);
    assert.equal(body.categoryId, 3);
    assert.equal(body.assignedUserId, 5);
    assert.equal(body.estimatedTime, 2);
    assert.equal(body.dueDate, "2026-04-01");
    assert.deepEqual(body.tags, ["bug", "urgent"]);
    assert.equal(body.importanceLevelId, 2);
  });

  it("does not include projectId in body", async () => {
    await handleTool("create_work_item", { projectId: 42, boardId: 7, title: "Task" });
    assert.equal(lastBody().projectId, undefined);
  });

  it("issues a PATCH to set stageId after creation when stageId is provided", async () => {
    const requests = [];
    globalThis.fetch = async (url, opts) => {
      requests.push({ url, opts });
      return { ok: true, status: 200, json: async () => ({ workItemId: 10, title: "Task" }) };
    };
    await handleTool("create_work_item", { projectId: 42, boardId: 7, title: "Task", stageId: 3 });
    assert.equal(requests.length, 2);
    assert.equal(requests[0].opts.method, "POST");
    assert.equal(requests[1].opts.method, "PATCH");
    assert.match(requests[1].url, /workitems\/10/);
    assert.equal(JSON.parse(requests[1].opts.body).stageId, 3);
  });

  it("does not issue a PATCH when stageId is not provided", async () => {
    const requests = [];
    globalThis.fetch = async (url, opts) => {
      requests.push({ url, opts });
      return { ok: true, status: 200, json: async () => ({ workItemId: 10 }) };
    };
    await handleTool("create_work_item", { projectId: 42, boardId: 7, title: "Task" });
    assert.equal(requests.length, 1);
  });

  it("sends Authorization header", async () => {
    await handleTool("create_work_item", { projectId: 1, boardId: 2, title: "Task" });
    assert.equal(lastRequest.opts.headers.Authorization, "ApiKey test-api-key");
  });

  it("sends Content-Type: application/json", async () => {
    await handleTool("create_work_item", { projectId: 1, boardId: 2, title: "Task" });
    assert.equal(lastRequest.opts.headers["Content-Type"], "application/json");
  });

  it("throws on API error response", async () => {
    globalThis.fetch = async () => ({ ok: false, status: 400, text: async () => "Bad Request" });
    await assert.rejects(
      () => handleTool("create_work_item", { projectId: 1, boardId: 2, title: "Task" }),
      /HacknPlan API error 400/
    );
  });

  it("returns the parsed JSON response", async () => {
    mockFetch({ json: async () => ({ id: 99, title: "Task" }) });
    const result = await handleTool("create_work_item", { projectId: 1, boardId: 2, title: "Task" });
    assert.equal(result.id, 99);
    assert.equal(result.title, "Task");
  });
});

describe("update_work_item", () => {
  beforeEach(() => mockFetch());

  it("sends PATCH to /projects/{projectId}/workitems/{workItemId}", async () => {
    await handleTool("update_work_item", { projectId: 1, workItemId: 5, title: "Updated" });
    assert.equal(lastRequest.opts.method, "PATCH");
    assert.equal(lastURL().pathname, "/v0/projects/1/workitems/5");
  });

  it("does not include projectId or workItemId in body", async () => {
    await handleTool("update_work_item", { projectId: 1, workItemId: 5, title: "Updated" });
    const body = lastBody();
    assert.equal(body.projectId, undefined);
    assert.equal(body.workItemId, undefined);
  });

  it("forwards all updatable fields in body", async () => {
    await handleTool("update_work_item", {
      projectId: 1,
      workItemId: 5,
      title: "Updated",
      description: "New desc",
      categoryId: 2,
      stageId: 3,
      assignedUserId: 4,
      estimatedTime: 8,
      dueDate: "2026-05-01",
      tags: ["v2"],
      priorityId: 4,
      isCompleted: true,
    });
    const body = lastBody();
    assert.equal(body.title, "Updated");
    assert.equal(body.description, "New desc");
    assert.equal(body.categoryId, 2);
    assert.equal(body.stageId, 3);
    assert.equal(body.assignedUserId, 4);
    assert.equal(body.estimatedTime, 8);
    assert.equal(body.dueDate, "2026-05-01");
    assert.deepEqual(body.tags, ["v2"]);
    assert.equal(body.priorityId, 4);
    assert.equal(body.isCompleted, true);
  });
});

describe("delete_board", () => {
  beforeEach(() => mock204());

  it("sends DELETE to /projects/{projectId}/boards/{boardId}", async () => {
    await handleTool("delete_board", { projectId: 42, boardId: 7 });
    assert.equal(lastRequest.opts.method, "DELETE");
    assert.equal(lastURL().pathname, "/v0/projects/42/boards/7");
  });

  it("returns null for 204 response", async () => {
    const result = await handleTool("delete_board", { projectId: 42, boardId: 7 });
    assert.equal(result, null);
  });
});

describe("delete_work_item", () => {
  beforeEach(() => mock204());

  it("sends DELETE to /projects/{projectId}/workitems/{workItemId}", async () => {
    await handleTool("delete_work_item", { projectId: 1, workItemId: 5 });
    assert.equal(lastRequest.opts.method, "DELETE");
    assert.equal(lastURL().pathname, "/v0/projects/1/workitems/5");
  });

  it("returns null for 204 response", async () => {
    const result = await handleTool("delete_work_item", { projectId: 1, workItemId: 5 });
    assert.equal(result, null);
  });
});

// ── Importance Levels ────────────────────────────────────────────────────────

describe("list_importance_levels", () => {
  beforeEach(() => mockFetch());

  it("sends GET to /projects/{projectId}/importancelevels", async () => {
    await handleTool("list_importance_levels", { projectId: 42 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/importancelevels");
  });
});

// ── Categories ────────────────────────────────────────────────────────────────

describe("list_categories", () => {
  beforeEach(() => mockFetch());

  it("sends GET to /projects/{projectId}/categories", async () => {
    await handleTool("list_categories", { projectId: 42 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/categories");
  });
});

// ── Stages ────────────────────────────────────────────────────────────────────

describe("list_stages", () => {
  beforeEach(() => mockFetch());

  it("sends GET to /projects/{projectId}/stages", async () => {
    await handleTool("list_stages", { projectId: 42 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/stages");
  });
});

// ── Users ─────────────────────────────────────────────────────────────────────

describe("list_project_users", () => {
  beforeEach(() => mockFetch());

  it("sends GET to /projects/{projectId}/users", async () => {
    await handleTool("list_project_users", { projectId: 42 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/users");
  });
});

describe("get_current_user", () => {
  beforeEach(() => mockFetch());

  it("sends GET to /users/me", async () => {
    await handleTool("get_current_user", {});
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/users/me");
  });
});

// ── Unknown tool ──────────────────────────────────────────────────────────────

describe("unknown tool", () => {
  it("throws for an unrecognized tool name", async () => {
    await assert.rejects(
      () => handleTool("nonexistent_tool", {}),
      /Unknown tool: nonexistent_tool/
    );
  });
});

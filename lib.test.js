import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

process.env.HACKNPLAN_API_KEY = "test-api-key";

const { handleTool } = await import("./lib.js");

// ── Helpers ───────────────────────────────────────────────────────────────────

let lastRequest;

function mockFetch(responseOverride = {}) {
  globalThis.fetch = async (url, opts) => {
    lastRequest = { url, opts };
    // Resolve the json value once so both json() and text() return the same data
    const jsonFn = responseOverride.json ?? (() => ({ id: 1 }));
    const jsonData = await jsonFn();
    // text() must return the JSON-serialised body so hnpRequest can parse it
    const textData = responseOverride.text ?? JSON.stringify(jsonData);
    return {
      ok: true,
      status: 200,
      json: async () => jsonData,
      text: async () => textData,
      ...responseOverride,
    };
  };
}

function mock204() {
  globalThis.fetch = async (url, opts) => {
    lastRequest = { url, opts };
    return { ok: true, status: 204, json: async () => null, text: async () => "" };
  };
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
      return { ok: true, status: 200, json: async () => ({ workItemId: 1 }), text: async () => JSON.stringify({ workItemId: 1 }) };
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
      return { ok: true, status: 200, json: async () => ({ workItemId: 10, title: "Task" }), text: async () => JSON.stringify({ workItemId: 10, title: "Task" }) };
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
      return { ok: true, status: 200, json: async () => ({ workItemId: 10 }), text: async () => JSON.stringify({ workItemId: 10 }) };
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
      importanceLevelId: 4,
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
    assert.equal(body.importanceLevelId, 4);
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

// ── New Project endpoints ──────────────────────────────────────────────────────

describe("delete_project", () => {
  beforeEach(() => mock204());

  it("sends DELETE to /projects/{projectId}", async () => {
    await handleTool("delete_project", { projectId: 42 });
    assert.equal(lastRequest.opts.method, "DELETE");
    assert.equal(lastURL().pathname, "/v0/projects/42");
  });

  it("returns null for 204 response", async () => {
    const result = await handleTool("delete_project", { projectId: 42 });
    assert.equal(result, null);
  });
});

describe("close_project", () => {
  beforeEach(() => mockFetch());

  it("sends POST to /projects/{projectId}/closure", async () => {
    await handleTool("close_project", { projectId: 42 });
    assert.equal(lastRequest.opts.method, "POST");
    assert.equal(lastURL().pathname, "/v0/projects/42/closure");
  });
});

describe("reopen_project", () => {
  beforeEach(() => mock204());

  it("sends DELETE to /projects/{projectId}/closure", async () => {
    await handleTool("reopen_project", { projectId: 42 });
    assert.equal(lastRequest.opts.method, "DELETE");
    assert.equal(lastURL().pathname, "/v0/projects/42/closure");
  });
});

describe("get_project_metrics", () => {
  beforeEach(() => mockFetch());

  it("sends GET to /projects/{projectId}/metrics", async () => {
    await handleTool("get_project_metrics", { projectId: 42 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/metrics");
  });
});

describe("change_project_owner", () => {
  beforeEach(() => mockFetch());

  it("sends PUT to /projects/{projectId}/owner", async () => {
    await handleTool("change_project_owner", { projectId: 42, userId: 7 });
    assert.equal(lastRequest.opts.method, "PUT");
    assert.equal(lastURL().pathname, "/v0/projects/42/owner");
  });

  it("sends userId in body", async () => {
    await handleTool("change_project_owner", { projectId: 42, userId: 7 });
    assert.equal(lastBody().userId, 7);
  });
});

// ── New Board endpoints ────────────────────────────────────────────────────────

describe("list_boards with includeClosed", () => {
  beforeEach(() => mockFetch());

  it("omits includeClosed when not provided", async () => {
    await handleTool("list_boards", { projectId: 42 });
    assert.equal(lastURL().searchParams.get("includeClosed"), null);
  });

  it("passes includeClosed=true as query param", async () => {
    await handleTool("list_boards", { projectId: 42, includeClosed: true });
    assert.equal(lastURL().searchParams.get("includeClosed"), "true");
  });
});

describe("update_board", () => {
  beforeEach(() => mockFetch());

  it("sends PATCH to /projects/{projectId}/boards/{boardId}", async () => {
    await handleTool("update_board", { projectId: 42, boardId: 7, name: "New Name" });
    assert.equal(lastRequest.opts.method, "PATCH");
    assert.equal(lastURL().pathname, "/v0/projects/42/boards/7");
  });

  it("does not include projectId or boardId in body", async () => {
    await handleTool("update_board", { projectId: 42, boardId: 7, name: "New Name" });
    const body = lastBody();
    assert.equal(body.projectId, undefined);
    assert.equal(body.boardId, undefined);
    assert.equal(body.name, "New Name");
  });
});

describe("delete_board with removeWorkItems", () => {
  beforeEach(() => mock204());

  it("omits removeWorkItems when not provided", async () => {
    await handleTool("delete_board", { projectId: 42, boardId: 7 });
    assert.equal(lastURL().searchParams.get("removeWorkItems"), null);
  });

  it("passes removeWorkItems=true as query param", async () => {
    await handleTool("delete_board", { projectId: 42, boardId: 7, removeWorkItems: true });
    assert.equal(lastURL().searchParams.get("removeWorkItems"), "true");
  });
});

describe("close_board", () => {
  beforeEach(() => mockFetch());

  it("sends POST to /projects/{projectId}/boards/{boardId}/closure", async () => {
    await handleTool("close_board", { projectId: 42, boardId: 7 });
    assert.equal(lastRequest.opts.method, "POST");
    assert.equal(lastURL().pathname, "/v0/projects/42/boards/7/closure");
  });
});

describe("reopen_board", () => {
  beforeEach(() => mock204());

  it("sends DELETE to /projects/{projectId}/boards/{boardId}/closure", async () => {
    await handleTool("reopen_board", { projectId: 42, boardId: 7 });
    assert.equal(lastRequest.opts.method, "DELETE");
    assert.equal(lastURL().pathname, "/v0/projects/42/boards/7/closure");
  });
});

describe("get_board_metrics", () => {
  beforeEach(() => mockFetch());

  it("sends GET to /projects/{projectId}/boards/{boardId}/metrics", async () => {
    await handleTool("get_board_metrics", { projectId: 42, boardId: 7 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/boards/7/metrics");
  });
});

// ── New Milestone endpoints ────────────────────────────────────────────────────

describe("get_milestone with includeBoards", () => {
  beforeEach(() => mockFetch());

  it("omits includeBoards when not provided", async () => {
    await handleTool("get_milestone", { projectId: 42, milestoneId: 3 });
    assert.equal(lastURL().searchParams.get("includeBoards"), null);
  });

  it("passes includeBoards=true as query param", async () => {
    await handleTool("get_milestone", { projectId: 42, milestoneId: 3, includeBoards: true });
    assert.equal(lastURL().searchParams.get("includeBoards"), "true");
  });
});

describe("update_milestone", () => {
  beforeEach(() => mockFetch());

  it("sends PATCH to /projects/{projectId}/milestones/{milestoneId}", async () => {
    await handleTool("update_milestone", { projectId: 42, milestoneId: 3, name: "Beta" });
    assert.equal(lastRequest.opts.method, "PATCH");
    assert.equal(lastURL().pathname, "/v0/projects/42/milestones/3");
  });

  it("does not include projectId or milestoneId in body", async () => {
    await handleTool("update_milestone", { projectId: 42, milestoneId: 3, name: "Beta" });
    const body = lastBody();
    assert.equal(body.projectId, undefined);
    assert.equal(body.milestoneId, undefined);
    assert.equal(body.name, "Beta");
  });

  it("forwards optional date fields in body", async () => {
    await handleTool("update_milestone", {
      projectId: 42,
      milestoneId: 3,
      startDate: "2026-05-01",
      endDate: "2026-07-31",
    });
    const body = lastBody();
    assert.equal(body.startDate, "2026-05-01");
    assert.equal(body.endDate, "2026-07-31");
  });
});

describe("delete_milestone with query params", () => {
  beforeEach(() => mock204());

  it("omits deleteBoards and deleteWorkItems when not provided", async () => {
    await handleTool("delete_milestone", { projectId: 42, milestoneId: 3 });
    assert.equal(lastURL().searchParams.get("deleteBoards"), null);
    assert.equal(lastURL().searchParams.get("deleteWorkItems"), null);
  });

  it("passes deleteBoards=true as query param", async () => {
    await handleTool("delete_milestone", { projectId: 42, milestoneId: 3, deleteBoards: true });
    assert.equal(lastURL().searchParams.get("deleteBoards"), "true");
  });

  it("passes deleteWorkItems=true as query param", async () => {
    await handleTool("delete_milestone", {
      projectId: 42,
      milestoneId: 3,
      deleteWorkItems: true,
    });
    assert.equal(lastURL().searchParams.get("deleteWorkItems"), "true");
  });

  it("passes both deleteBoards and deleteWorkItems when provided", async () => {
    await handleTool("delete_milestone", {
      projectId: 42,
      milestoneId: 3,
      deleteBoards: true,
      deleteWorkItems: true,
    });
    assert.equal(lastURL().searchParams.get("deleteBoards"), "true");
    assert.equal(lastURL().searchParams.get("deleteWorkItems"), "true");
  });
});

describe("close_milestone", () => {
  beforeEach(() => mockFetch());

  it("sends POST to /projects/{projectId}/milestones/{milestoneId}/closure", async () => {
    await handleTool("close_milestone", { projectId: 42, milestoneId: 3 });
    assert.equal(lastRequest.opts.method, "POST");
    assert.equal(lastURL().pathname, "/v0/projects/42/milestones/3/closure");
  });
});

describe("reopen_milestone", () => {
  beforeEach(() => mock204());

  it("sends DELETE to /projects/{projectId}/milestones/{milestoneId}/closure", async () => {
    await handleTool("reopen_milestone", { projectId: 42, milestoneId: 3 });
    assert.equal(lastRequest.opts.method, "DELETE");
    assert.equal(lastURL().pathname, "/v0/projects/42/milestones/3/closure");
  });
});

describe("get_milestone_metrics", () => {
  beforeEach(() => mockFetch());

  it("sends GET to /projects/{projectId}/milestones/{milestoneId}/metrics", async () => {
    await handleTool("get_milestone_metrics", { projectId: 42, milestoneId: 3 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/milestones/3/metrics");
  });
});

// ── New Work Item endpoints ────────────────────────────────────────────────────

describe("list_work_items new filter params", () => {
  beforeEach(() => mockFetch());

  it("forwards milestoneId as query param", async () => {
    await handleTool("list_work_items", { projectId: 42, milestoneId: 5 });
    assert.equal(lastURL().searchParams.get("milestoneId"), "5");
  });

  it("forwards importanceLevelId as query param", async () => {
    await handleTool("list_work_items", { projectId: 42, importanceLevelId: 2 });
    assert.equal(lastURL().searchParams.get("importanceLevelId"), "2");
  });

  it("forwards parentStoryId as query param", async () => {
    await handleTool("list_work_items", { projectId: 42, parentStoryId: 10 });
    assert.equal(lastURL().searchParams.get("parentStoryId"), "10");
  });

  it("forwards designElementId as query param", async () => {
    await handleTool("list_work_items", { projectId: 42, designElementId: 3 });
    assert.equal(lastURL().searchParams.get("designElementId"), "3");
  });

  it("forwards searchTerms as query param", async () => {
    await handleTool("list_work_items", { projectId: 42, searchTerms: "collision bug" });
    assert.equal(lastURL().searchParams.get("searchTerms"), "collision bug");
  });

  it("forwards sortField and sortMode as query params", async () => {
    await handleTool("list_work_items", { projectId: 42, sortField: "title", sortMode: "asc" });
    assert.equal(lastURL().searchParams.get("sortField"), "title");
    assert.equal(lastURL().searchParams.get("sortMode"), "asc");
  });
});

describe("clone_work_item", () => {
  beforeEach(() => mockFetch());

  it("sends POST to /projects/{projectId}/workitems/{workItemId}", async () => {
    await handleTool("clone_work_item", { projectId: 42, workItemId: 99 });
    assert.equal(lastRequest.opts.method, "POST");
    assert.equal(lastURL().pathname, "/v0/projects/42/workitems/99");
  });

  it("passes boardId as query param when provided", async () => {
    await handleTool("clone_work_item", { projectId: 42, workItemId: 99, boardId: 7 });
    assert.equal(lastURL().searchParams.get("boardId"), "7");
  });

  it("omits boardId query param when not provided", async () => {
    await handleTool("clone_work_item", { projectId: 42, workItemId: 99 });
    assert.equal(lastURL().searchParams.get("boardId"), null);
  });
});

// ── Categories CRUD ────────────────────────────────────────────────────────────

describe("create_category", () => {
  beforeEach(() => mockFetch());

  it("sends POST to /projects/{projectId}/categories", async () => {
    await handleTool("create_category", { projectId: 42, name: "Art" });
    assert.equal(lastRequest.opts.method, "POST");
    assert.equal(lastURL().pathname, "/v0/projects/42/categories");
  });

  it("sends name in body and excludes projectId", async () => {
    await handleTool("create_category", { projectId: 42, name: "Art" });
    const body = lastBody();
    assert.equal(body.name, "Art");
    assert.equal(body.projectId, undefined);
  });
});

describe("get_category", () => {
  beforeEach(() => mockFetch());

  it("sends GET to /projects/{projectId}/categories/{categoryId}", async () => {
    await handleTool("get_category", { projectId: 42, categoryId: 5 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/categories/5");
  });
});

describe("update_category", () => {
  beforeEach(() => mockFetch());

  it("sends PATCH to /projects/{projectId}/categories/{categoryId}", async () => {
    await handleTool("update_category", { projectId: 42, categoryId: 5, name: "Updated Art" });
    assert.equal(lastRequest.opts.method, "PATCH");
    assert.equal(lastURL().pathname, "/v0/projects/42/categories/5");
  });

  it("does not include projectId or categoryId in body", async () => {
    await handleTool("update_category", { projectId: 42, categoryId: 5, name: "Updated Art" });
    const body = lastBody();
    assert.equal(body.projectId, undefined);
    assert.equal(body.categoryId, undefined);
    assert.equal(body.name, "Updated Art");
  });
});

describe("delete_category", () => {
  beforeEach(() => mock204());

  it("sends DELETE to /projects/{projectId}/categories/{categoryId}", async () => {
    await handleTool("delete_category", { projectId: 42, categoryId: 5 });
    assert.equal(lastRequest.opts.method, "DELETE");
    assert.equal(lastURL().pathname, "/v0/projects/42/categories/5");
  });

  it("returns null for 204 response", async () => {
    const result = await handleTool("delete_category", { projectId: 42, categoryId: 5 });
    assert.equal(result, null);
  });
});

// ── Stages CRUD ────────────────────────────────────────────────────────────────

describe("create_stage", () => {
  beforeEach(() => mockFetch());

  it("sends POST to /projects/{projectId}/stages", async () => {
    await handleTool("create_stage", { projectId: 42, name: "In Review" });
    assert.equal(lastRequest.opts.method, "POST");
    assert.equal(lastURL().pathname, "/v0/projects/42/stages");
  });

  it("sends name in body and excludes projectId", async () => {
    await handleTool("create_stage", { projectId: 42, name: "In Review" });
    const body = lastBody();
    assert.equal(body.name, "In Review");
    assert.equal(body.projectId, undefined);
  });
});

describe("get_stage", () => {
  beforeEach(() => mockFetch());

  it("sends GET to /projects/{projectId}/stages/{stageId}", async () => {
    await handleTool("get_stage", { projectId: 42, stageId: 8 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/stages/8");
  });
});

describe("update_stage", () => {
  beforeEach(() => mockFetch());

  it("sends PATCH to /projects/{projectId}/stages/{stageId}", async () => {
    await handleTool("update_stage", { projectId: 42, stageId: 8, name: "Done" });
    assert.equal(lastRequest.opts.method, "PATCH");
    assert.equal(lastURL().pathname, "/v0/projects/42/stages/8");
  });

  it("does not include projectId or stageId in body", async () => {
    await handleTool("update_stage", { projectId: 42, stageId: 8, name: "Done" });
    const body = lastBody();
    assert.equal(body.projectId, undefined);
    assert.equal(body.stageId, undefined);
    assert.equal(body.name, "Done");
  });
});

describe("delete_stage", () => {
  beforeEach(() => mock204());

  it("sends DELETE to /projects/{projectId}/stages/{stageId}", async () => {
    await handleTool("delete_stage", { projectId: 42, stageId: 8 });
    assert.equal(lastRequest.opts.method, "DELETE");
    assert.equal(lastURL().pathname, "/v0/projects/42/stages/8");
  });

  it("returns null for 204 response", async () => {
    const result = await handleTool("delete_stage", { projectId: 42, stageId: 8 });
    assert.equal(result, null);
  });
});

// ── Importance Levels CRUD ─────────────────────────────────────────────────────

describe("create_importance_level", () => {
  beforeEach(() => mockFetch());

  it("sends POST to /projects/{projectId}/importancelevels", async () => {
    await handleTool("create_importance_level", { projectId: 42, name: "Critical" });
    assert.equal(lastRequest.opts.method, "POST");
    assert.equal(lastURL().pathname, "/v0/projects/42/importancelevels");
  });

  it("sends name in body and excludes projectId", async () => {
    await handleTool("create_importance_level", { projectId: 42, name: "Critical" });
    const body = lastBody();
    assert.equal(body.name, "Critical");
    assert.equal(body.projectId, undefined);
  });
});

describe("get_importance_level", () => {
  beforeEach(() => mockFetch());

  it("sends GET to /projects/{projectId}/importancelevels/{importanceLevelId}", async () => {
    await handleTool("get_importance_level", { projectId: 42, importanceLevelId: 3 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/importancelevels/3");
  });
});

describe("update_importance_level", () => {
  beforeEach(() => mockFetch());

  it("sends PATCH to /projects/{projectId}/importancelevels/{importanceLevelId}", async () => {
    await handleTool("update_importance_level", {
      projectId: 42,
      importanceLevelId: 3,
      name: "Medium",
    });
    assert.equal(lastRequest.opts.method, "PATCH");
    assert.equal(lastURL().pathname, "/v0/projects/42/importancelevels/3");
  });

  it("does not include projectId or importanceLevelId in body", async () => {
    await handleTool("update_importance_level", {
      projectId: 42,
      importanceLevelId: 3,
      name: "Medium",
    });
    const body = lastBody();
    assert.equal(body.projectId, undefined);
    assert.equal(body.importanceLevelId, undefined);
    assert.equal(body.name, "Medium");
  });
});

describe("delete_importance_level", () => {
  beforeEach(() => mock204());

  it("sends DELETE to /projects/{projectId}/importancelevels/{importanceLevelId}", async () => {
    await handleTool("delete_importance_level", { projectId: 42, importanceLevelId: 3 });
    assert.equal(lastRequest.opts.method, "DELETE");
    assert.equal(lastURL().pathname, "/v0/projects/42/importancelevels/3");
  });

  it("returns null for 204 response", async () => {
    const result = await handleTool("delete_importance_level", {
      projectId: 42,
      importanceLevelId: 3,
    });
    assert.equal(result, null);
  });
});

// ── Users ──────────────────────────────────────────────────────────────────────

describe("get_project_user", () => {
  beforeEach(() => mockFetch());

  it("sends GET to /projects/{projectId}/users/{userId}", async () => {
    await handleTool("get_project_user", { projectId: 42, userId: 7 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/users/7");
  });
});

// ── Full-replace (PUT) variants ────────────────────────────────────────────────

describe("replace_project", () => {
  beforeEach(() => mockFetch());
  it("sends PUT to /projects/{projectId}", async () => {
    await handleTool("replace_project", { projectId: 42, name: "New", costMetric: "points" });
    assert.equal(lastRequest.opts.method, "PUT");
    assert.equal(lastURL().pathname, "/v0/projects/42");
  });
  it("sends body without projectId", async () => {
    await handleTool("replace_project", { projectId: 42, name: "New", costMetric: "points" });
    const body = lastBody();
    assert.equal(body.name, "New");
    assert.equal(body.projectId, undefined);
  });
});

describe("replace_board", () => {
  beforeEach(() => mockFetch());
  it("sends PUT to /projects/{projectId}/boards/{boardId}", async () => {
    await handleTool("replace_board", { projectId: 42, boardId: 7, name: "New" });
    assert.equal(lastRequest.opts.method, "PUT");
    assert.equal(lastURL().pathname, "/v0/projects/42/boards/7");
  });
  it("body excludes projectId and boardId", async () => {
    await handleTool("replace_board", { projectId: 42, boardId: 7, name: "New" });
    const body = lastBody();
    assert.equal(body.projectId, undefined);
    assert.equal(body.boardId, undefined);
    assert.equal(body.name, "New");
  });
});

describe("replace_milestone", () => {
  beforeEach(() => mockFetch());
  it("sends PUT to /projects/{projectId}/milestones/{milestoneId}", async () => {
    await handleTool("replace_milestone", { projectId: 42, milestoneId: 3, name: "New" });
    assert.equal(lastRequest.opts.method, "PUT");
    assert.equal(lastURL().pathname, "/v0/projects/42/milestones/3");
  });
});

// ── Default board ──────────────────────────────────────────────────────────────

describe("set_default_board", () => {
  beforeEach(() => mockFetch());
  it("sends POST to /projects/{projectId}/boards/default", async () => {
    await handleTool("set_default_board", { projectId: 42, boardId: 7 });
    assert.equal(lastRequest.opts.method, "POST");
    assert.equal(lastURL().pathname, "/v0/projects/42/boards/default");
  });
  it("sends boardId in body", async () => {
    await handleTool("set_default_board", { projectId: 42, boardId: 7 });
    assert.equal(lastBody().boardId, 7);
  });
});

describe("clear_default_board", () => {
  beforeEach(() => mock204());
  it("sends DELETE to /projects/{projectId}/boards/default", async () => {
    await handleTool("clear_default_board", { projectId: 42 });
    assert.equal(lastRequest.opts.method, "DELETE");
    assert.equal(lastURL().pathname, "/v0/projects/42/boards/default");
  });
});

// ── Work Item Attachments ──────────────────────────────────────────────────────

describe("list_work_item_attachments", () => {
  beforeEach(() => mockFetch());
  it("sends GET to /projects/{projectId}/workitems/{workItemId}/attachments", async () => {
    await handleTool("list_work_item_attachments", { projectId: 42, workItemId: 9 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/workitems/9/attachments");
  });
});

describe("get_work_item_attachment", () => {
  beforeEach(() => mockFetch());
  it("sends GET to /projects/{projectId}/workitems/{workItemId}/attachments/{attachmentId}", async () => {
    await handleTool("get_work_item_attachment", { projectId: 42, workItemId: 9, attachmentId: 3 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/workitems/9/attachments/3");
  });
});

describe("delete_work_item_attachment", () => {
  beforeEach(() => mock204());
  it("sends DELETE to /projects/{projectId}/workitems/{workItemId}/attachments/{attachmentId}", async () => {
    await handleTool("delete_work_item_attachment", { projectId: 42, workItemId: 9, attachmentId: 3 });
    assert.equal(lastRequest.opts.method, "DELETE");
    assert.equal(lastURL().pathname, "/v0/projects/42/workitems/9/attachments/3");
  });
});

// ── User management ────────────────────────────────────────────────────────────

describe("add_project_user", () => {
  beforeEach(() => mockFetch());
  it("sends POST to /projects/{projectId}/users", async () => {
    await handleTool("add_project_user", { projectId: 42, userId: 7 });
    assert.equal(lastRequest.opts.method, "POST");
    assert.equal(lastURL().pathname, "/v0/projects/42/users");
  });
  it("sends userId in body, excludes projectId", async () => {
    await handleTool("add_project_user", { projectId: 42, userId: 7 });
    const body = lastBody();
    assert.equal(body.userId, 7);
    assert.equal(body.projectId, undefined);
  });
});

describe("update_project_user", () => {
  beforeEach(() => mockFetch());
  it("sends PATCH to /projects/{projectId}/users/{userId}", async () => {
    await handleTool("update_project_user", { projectId: 42, userId: 7, isAdmin: true });
    assert.equal(lastRequest.opts.method, "PATCH");
    assert.equal(lastURL().pathname, "/v0/projects/42/users/7");
  });
  it("body excludes projectId and userId", async () => {
    await handleTool("update_project_user", { projectId: 42, userId: 7, isAdmin: true });
    const body = lastBody();
    assert.equal(body.projectId, undefined);
    assert.equal(body.userId, undefined);
    assert.equal(body.isAdmin, true);
  });
});

describe("replace_project_user", () => {
  beforeEach(() => mockFetch());
  it("sends PUT to /projects/{projectId}/users/{userId}", async () => {
    await handleTool("replace_project_user", { projectId: 42, userId: 7 });
    assert.equal(lastRequest.opts.method, "PUT");
    assert.equal(lastURL().pathname, "/v0/projects/42/users/7");
  });
});

describe("add_team_to_project", () => {
  beforeEach(() => mockFetch());
  it("sends POST to /projects/{projectId}/teams", async () => {
    await handleTool("add_team_to_project", { projectId: 42, teamId: 5 });
    assert.equal(lastRequest.opts.method, "POST");
    assert.equal(lastURL().pathname, "/v0/projects/42/teams");
  });
  it("sends teamId in body", async () => {
    await handleTool("add_team_to_project", { projectId: 42, teamId: 5 });
    assert.equal(lastBody().teamId, 5);
  });
});

// ── Project Roles ──────────────────────────────────────────────────────────────

describe("list_project_roles", () => {
  beforeEach(() => mockFetch());
  it("sends GET to /projects/{projectId}/roles", async () => {
    await handleTool("list_project_roles", { projectId: 42 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/roles");
  });
});

describe("create_project_role", () => {
  beforeEach(() => mockFetch());
  it("sends POST to /projects/{projectId}/roles with name in body", async () => {
    await handleTool("create_project_role", { projectId: 42, name: "Artist" });
    assert.equal(lastRequest.opts.method, "POST");
    assert.equal(lastURL().pathname, "/v0/projects/42/roles");
    assert.equal(lastBody().name, "Artist");
  });
});

describe("get_project_role", () => {
  beforeEach(() => mockFetch());
  it("sends GET to /projects/{projectId}/roles/{roleId}", async () => {
    await handleTool("get_project_role", { projectId: 42, roleId: 3 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/roles/3");
  });
});

describe("update_project_role", () => {
  beforeEach(() => mockFetch());
  it("sends PATCH to /projects/{projectId}/roles/{roleId}", async () => {
    await handleTool("update_project_role", { projectId: 42, roleId: 3, name: "Senior Artist" });
    assert.equal(lastRequest.opts.method, "PATCH");
    assert.equal(lastURL().pathname, "/v0/projects/42/roles/3");
  });
  it("body excludes projectId and roleId", async () => {
    await handleTool("update_project_role", { projectId: 42, roleId: 3, name: "Senior" });
    const body = lastBody();
    assert.equal(body.projectId, undefined);
    assert.equal(body.roleId, undefined);
  });
});

describe("replace_project_role", () => {
  beforeEach(() => mockFetch());
  it("sends PUT to /projects/{projectId}/roles/{roleId}", async () => {
    await handleTool("replace_project_role", { projectId: 42, roleId: 3, name: "Lead Artist" });
    assert.equal(lastRequest.opts.method, "PUT");
    assert.equal(lastURL().pathname, "/v0/projects/42/roles/3");
  });
});

describe("delete_project_role", () => {
  beforeEach(() => mock204());
  it("sends DELETE to /projects/{projectId}/roles/{roleId}", async () => {
    await handleTool("delete_project_role", { projectId: 42, roleId: 3 });
    assert.equal(lastRequest.opts.method, "DELETE");
    assert.equal(lastURL().pathname, "/v0/projects/42/roles/3");
  });
});

// ── Project Tags ───────────────────────────────────────────────────────────────

describe("list_project_tags", () => {
  beforeEach(() => mockFetch());
  it("sends GET to /projects/{projectId}/tags", async () => {
    await handleTool("list_project_tags", { projectId: 42 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/tags");
  });
});

describe("create_project_tag", () => {
  beforeEach(() => mockFetch());
  it("sends POST to /projects/{projectId}/tags with name in body", async () => {
    await handleTool("create_project_tag", { projectId: 42, name: "bug" });
    assert.equal(lastRequest.opts.method, "POST");
    assert.equal(lastURL().pathname, "/v0/projects/42/tags");
    assert.equal(lastBody().name, "bug");
  });
});

describe("update_project_tag", () => {
  beforeEach(() => mockFetch());
  it("sends PATCH to /projects/{projectId}/tags/{tagId}", async () => {
    await handleTool("update_project_tag", { projectId: 42, tagId: 5, name: "bug-fix" });
    assert.equal(lastRequest.opts.method, "PATCH");
    assert.equal(lastURL().pathname, "/v0/projects/42/tags/5");
  });
  it("body excludes projectId and tagId", async () => {
    await handleTool("update_project_tag", { projectId: 42, tagId: 5, name: "bug-fix" });
    const body = lastBody();
    assert.equal(body.projectId, undefined);
    assert.equal(body.tagId, undefined);
  });
});

describe("replace_project_tag", () => {
  beforeEach(() => mockFetch());
  it("sends PUT to /projects/{projectId}/tags/{tagId}", async () => {
    await handleTool("replace_project_tag", { projectId: 42, tagId: 5, name: "bug-fix" });
    assert.equal(lastRequest.opts.method, "PUT");
    assert.equal(lastURL().pathname, "/v0/projects/42/tags/5");
  });
});

describe("delete_project_tag", () => {
  beforeEach(() => mock204());
  it("sends DELETE to /projects/{projectId}/tags/{tagId}", async () => {
    await handleTool("delete_project_tag", { projectId: 42, tagId: 5 });
    assert.equal(lastRequest.opts.method, "DELETE");
    assert.equal(lastURL().pathname, "/v0/projects/42/tags/5");
  });
});

// ── Design Elements ────────────────────────────────────────────────────────────

describe("list_design_elements", () => {
  beforeEach(() => mockFetch());
  it("sends GET to /projects/{projectId}/designelements", async () => {
    await handleTool("list_design_elements", { projectId: 42 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/designelements");
  });
  it("forwards typeId filter as query param", async () => {
    await handleTool("list_design_elements", { projectId: 42, typeId: 3 });
    assert.equal(lastURL().searchParams.get("typeId"), "3");
  });
});

describe("create_design_element", () => {
  beforeEach(() => mockFetch());
  it("sends POST to /projects/{projectId}/designelements", async () => {
    await handleTool("create_design_element", { projectId: 42, name: "Combat System", typeId: 1 });
    assert.equal(lastRequest.opts.method, "POST");
    assert.equal(lastURL().pathname, "/v0/projects/42/designelements");
  });
  it("sends name and typeId in body, excludes projectId", async () => {
    await handleTool("create_design_element", { projectId: 42, name: "Combat System", typeId: 1 });
    const body = lastBody();
    assert.equal(body.name, "Combat System");
    assert.equal(body.typeId, 1);
    assert.equal(body.projectId, undefined);
  });
});

describe("get_design_element", () => {
  beforeEach(() => mockFetch());
  it("sends GET to /projects/{projectId}/designelements/{designElementId}", async () => {
    await handleTool("get_design_element", { projectId: 42, designElementId: 8 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/designelements/8");
  });
});

describe("update_design_element", () => {
  beforeEach(() => mockFetch());
  it("sends PATCH to /projects/{projectId}/designelements/{designElementId}", async () => {
    await handleTool("update_design_element", { projectId: 42, designElementId: 8, name: "Updated" });
    assert.equal(lastRequest.opts.method, "PATCH");
    assert.equal(lastURL().pathname, "/v0/projects/42/designelements/8");
  });
  it("body excludes projectId and designElementId", async () => {
    await handleTool("update_design_element", { projectId: 42, designElementId: 8, name: "Updated" });
    const body = lastBody();
    assert.equal(body.projectId, undefined);
    assert.equal(body.designElementId, undefined);
  });
});

describe("replace_design_element", () => {
  beforeEach(() => mockFetch());
  it("sends PUT to /projects/{projectId}/designelements/{designElementId}", async () => {
    await handleTool("replace_design_element", { projectId: 42, designElementId: 8, name: "New", typeId: 1 });
    assert.equal(lastRequest.opts.method, "PUT");
    assert.equal(lastURL().pathname, "/v0/projects/42/designelements/8");
  });
});

describe("delete_design_element", () => {
  beforeEach(() => mock204());
  it("sends DELETE to /projects/{projectId}/designelements/{designElementId}", async () => {
    await handleTool("delete_design_element", { projectId: 42, designElementId: 8 });
    assert.equal(lastRequest.opts.method, "DELETE");
    assert.equal(lastURL().pathname, "/v0/projects/42/designelements/8");
  });
});

describe("get_design_element_metrics", () => {
  beforeEach(() => mockFetch());
  it("sends GET to /projects/{projectId}/designelements/{designElementId}/metrics", async () => {
    await handleTool("get_design_element_metrics", { projectId: 42, designElementId: 8 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/designelements/8/metrics");
  });
});

// ── Design Element Attachments ─────────────────────────────────────────────────

describe("list_design_element_attachments", () => {
  beforeEach(() => mockFetch());
  it("sends GET to .../designelements/{designElementId}/attachments", async () => {
    await handleTool("list_design_element_attachments", { projectId: 42, designElementId: 8 });
    assert.equal(lastURL().pathname, "/v0/projects/42/designelements/8/attachments");
  });
});

describe("get_design_element_attachment", () => {
  beforeEach(() => mockFetch());
  it("sends GET to .../designelements/{designElementId}/attachments/{attachmentId}", async () => {
    await handleTool("get_design_element_attachment", { projectId: 42, designElementId: 8, attachmentId: 2 });
    assert.equal(lastURL().pathname, "/v0/projects/42/designelements/8/attachments/2");
  });
});

describe("delete_design_element_attachment", () => {
  beforeEach(() => mock204());
  it("sends DELETE to .../designelements/{designElementId}/attachments/{attachmentId}", async () => {
    await handleTool("delete_design_element_attachment", { projectId: 42, designElementId: 8, attachmentId: 2 });
    assert.equal(lastRequest.opts.method, "DELETE");
    assert.equal(lastURL().pathname, "/v0/projects/42/designelements/8/attachments/2");
  });
});

// ── Design Element Comments ────────────────────────────────────────────────────

describe("list_design_element_comments", () => {
  beforeEach(() => mockFetch());
  it("sends GET to .../designelements/{designElementId}/comments", async () => {
    await handleTool("list_design_element_comments", { projectId: 42, designElementId: 8 });
    assert.equal(lastURL().pathname, "/v0/projects/42/designelements/8/comments");
  });
});

describe("create_design_element_comment", () => {
  beforeEach(() => mockFetch());
  it("sends POST to .../designelements/{designElementId}/comments", async () => {
    await handleTool("create_design_element_comment", { projectId: 42, designElementId: 8, text: "Looks good" });
    assert.equal(lastRequest.opts.method, "POST");
    assert.equal(lastURL().pathname, "/v0/projects/42/designelements/8/comments");
    assert.equal(lastBody().text, "Looks good");
  });
});

describe("update_design_element_comment", () => {
  beforeEach(() => mockFetch());
  it("sends PUT to .../designelements/{designElementId}/comments/{commentId}", async () => {
    await handleTool("update_design_element_comment", { projectId: 42, designElementId: 8, commentId: 1, text: "Updated" });
    assert.equal(lastRequest.opts.method, "PUT");
    assert.equal(lastURL().pathname, "/v0/projects/42/designelements/8/comments/1");
    assert.equal(lastBody().text, "Updated");
  });
});

describe("delete_design_element_comment", () => {
  beforeEach(() => mock204());
  it("sends DELETE to .../designelements/{designElementId}/comments/{commentId}", async () => {
    await handleTool("delete_design_element_comment", { projectId: 42, designElementId: 8, commentId: 1 });
    assert.equal(lastRequest.opts.method, "DELETE");
    assert.equal(lastURL().pathname, "/v0/projects/42/designelements/8/comments/1");
  });
});

// ── Design Element Types ───────────────────────────────────────────────────────

describe("list_design_element_types", () => {
  beforeEach(() => mockFetch());
  it("sends GET to /projects/{projectId}/designelementtypes", async () => {
    await handleTool("list_design_element_types", { projectId: 42 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/designelementtypes");
  });
});

describe("create_design_element_type", () => {
  beforeEach(() => mockFetch());
  it("sends POST to /projects/{projectId}/designelementtypes", async () => {
    await handleTool("create_design_element_type", { projectId: 42, name: "Mechanic" });
    assert.equal(lastRequest.opts.method, "POST");
    assert.equal(lastURL().pathname, "/v0/projects/42/designelementtypes");
    assert.equal(lastBody().name, "Mechanic");
  });
});

describe("get_design_element_type", () => {
  beforeEach(() => mockFetch());
  it("sends GET to /projects/{projectId}/designelementtypes/{designElementTypeId}", async () => {
    await handleTool("get_design_element_type", { projectId: 42, designElementTypeId: 2 });
    assert.equal(lastURL().pathname, "/v0/projects/42/designelementtypes/2");
  });
});

describe("update_design_element_type", () => {
  beforeEach(() => mockFetch());
  it("sends PATCH to /projects/{projectId}/designelementtypes/{designElementTypeId}", async () => {
    await handleTool("update_design_element_type", { projectId: 42, designElementTypeId: 2, name: "Core Mechanic" });
    assert.equal(lastRequest.opts.method, "PATCH");
    assert.equal(lastURL().pathname, "/v0/projects/42/designelementtypes/2");
  });
  it("body excludes projectId and designElementTypeId", async () => {
    await handleTool("update_design_element_type", { projectId: 42, designElementTypeId: 2, name: "Core" });
    const body = lastBody();
    assert.equal(body.projectId, undefined);
    assert.equal(body.designElementTypeId, undefined);
  });
});

describe("replace_design_element_type", () => {
  beforeEach(() => mockFetch());
  it("sends PUT to /projects/{projectId}/designelementtypes/{designElementTypeId}", async () => {
    await handleTool("replace_design_element_type", { projectId: 42, designElementTypeId: 2, name: "Core" });
    assert.equal(lastRequest.opts.method, "PUT");
    assert.equal(lastURL().pathname, "/v0/projects/42/designelementtypes/2");
  });
});

describe("delete_design_element_type", () => {
  beforeEach(() => mock204());
  it("sends DELETE to /projects/{projectId}/designelementtypes/{designElementTypeId}", async () => {
    await handleTool("delete_design_element_type", { projectId: 42, designElementTypeId: 2 });
    assert.equal(lastRequest.opts.method, "DELETE");
    assert.equal(lastURL().pathname, "/v0/projects/42/designelementtypes/2");
  });
});

// ── Events & Files ─────────────────────────────────────────────────────────────

describe("list_project_events", () => {
  beforeEach(() => mockFetch());
  it("sends GET to /projects/{projectId}/events", async () => {
    await handleTool("list_project_events", { projectId: 42 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/events");
  });
  it("forwards limit and offset as query params", async () => {
    await handleTool("list_project_events", { projectId: 42, limit: 10, offset: 5 });
    assert.equal(lastURL().searchParams.get("limit"), "10");
    assert.equal(lastURL().searchParams.get("offset"), "5");
  });
});

describe("list_project_files", () => {
  beforeEach(() => mockFetch());
  it("sends GET to /projects/{projectId}/files", async () => {
    await handleTool("list_project_files", { projectId: 42 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/files");
  });
});

describe("delete_project_file", () => {
  beforeEach(() => mock204());
  it("sends DELETE to /projects/{projectId}/files/{fileId}", async () => {
    await handleTool("delete_project_file", { projectId: 42, fileId: 99 });
    assert.equal(lastRequest.opts.method, "DELETE");
    assert.equal(lastURL().pathname, "/v0/projects/42/files/99");
  });
});

describe("get_project_storage", () => {
  beforeEach(() => mockFetch());
  it("sends GET to /projects/{projectId}/storage", async () => {
    await handleTool("get_project_storage", { projectId: 42 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/storage");
  });
});

// ── Webhooks ───────────────────────────────────────────────────────────────────

describe("list_webhook_event_types", () => {
  beforeEach(() => mockFetch());
  it("sends GET to /webhookevents", async () => {
    await handleTool("list_webhook_event_types", {});
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/webhookevents");
  });
});

describe("list_webhooks", () => {
  beforeEach(() => mockFetch());
  it("sends GET to /projects/{projectId}/webhooks", async () => {
    await handleTool("list_webhooks", { projectId: 42 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/webhooks");
  });
});

describe("create_webhook", () => {
  beforeEach(() => mockFetch());
  it("sends POST to /projects/{projectId}/webhooks", async () => {
    await handleTool("create_webhook", { projectId: 42, url: "https://example.com/hook", events: ["workitem.created"] });
    assert.equal(lastRequest.opts.method, "POST");
    assert.equal(lastURL().pathname, "/v0/projects/42/webhooks");
  });
  it("sends url and events in body, excludes projectId", async () => {
    await handleTool("create_webhook", { projectId: 42, url: "https://example.com/hook", events: ["workitem.created"] });
    const body = lastBody();
    assert.equal(body.url, "https://example.com/hook");
    assert.deepEqual(body.events, ["workitem.created"]);
    assert.equal(body.projectId, undefined);
  });
});

describe("get_webhook", () => {
  beforeEach(() => mockFetch());
  it("sends GET to /projects/{projectId}/webhooks/{webhookId}", async () => {
    await handleTool("get_webhook", { projectId: 42, webhookId: 5 });
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects/42/webhooks/5");
  });
});

describe("update_webhook", () => {
  beforeEach(() => mockFetch());
  it("sends PATCH to /projects/{projectId}/webhooks/{webhookId}", async () => {
    await handleTool("update_webhook", { projectId: 42, webhookId: 5, url: "https://example.com/new" });
    assert.equal(lastRequest.opts.method, "PATCH");
    assert.equal(lastURL().pathname, "/v0/projects/42/webhooks/5");
  });
  it("body excludes projectId and webhookId", async () => {
    await handleTool("update_webhook", { projectId: 42, webhookId: 5, url: "https://example.com/new" });
    const body = lastBody();
    assert.equal(body.projectId, undefined);
    assert.equal(body.webhookId, undefined);
  });
});

describe("replace_webhook", () => {
  beforeEach(() => mockFetch());
  it("sends PUT to /projects/{projectId}/webhooks/{webhookId}", async () => {
    await handleTool("replace_webhook", { projectId: 42, webhookId: 5, url: "https://example.com/hook", events: ["workitem.created"] });
    assert.equal(lastRequest.opts.method, "PUT");
    assert.equal(lastURL().pathname, "/v0/projects/42/webhooks/5");
  });
});

describe("delete_webhook", () => {
  beforeEach(() => mock204());
  it("sends DELETE to /projects/{projectId}/webhooks/{webhookId}", async () => {
    await handleTool("delete_webhook", { projectId: 42, webhookId: 5 });
    assert.equal(lastRequest.opts.method, "DELETE");
    assert.equal(lastURL().pathname, "/v0/projects/42/webhooks/5");
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

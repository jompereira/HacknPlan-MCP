import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

process.env.HACKNPLAN_API_KEY = "test-api-key";

const { handleTool } = await import("./lib.js");

// Helpers to mock fetch and capture the last request
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

function lastBody() {
  return JSON.parse(lastRequest.opts.body);
}

function lastURL() {
  return new URL(lastRequest.url);
}

// ── create_work_item ─────────────────────────────────────────────────────────

describe("create_work_item", () => {
  beforeEach(() => mockFetch());

  it("sends POST to /projects/{projectId}/workitems", async () => {
    await handleTool("create_work_item", { projectId: 42, boardId: 7, title: "Fix bug" });
    assert.equal(lastRequest.opts.method, "POST");
    assert.equal(lastURL().pathname, "/v0/projects/42/workitems");
  });

  it("puts boardId in the request body, not the query string", async () => {
    await handleTool("create_work_item", { projectId: 42, boardId: 7, title: "Fix bug" });
    const body = lastBody();
    assert.equal(body.boardId, 7, "boardId should be in body");
    assert.equal(lastURL().searchParams.get("boardId"), null, "boardId must not be a query param");
  });

  it("puts title in the request body", async () => {
    await handleTool("create_work_item", { projectId: 42, boardId: 7, title: "Fix bug" });
    assert.equal(lastBody().title, "Fix bug");
  });

  it("forwards all optional fields in the body", async () => {
    await handleTool("create_work_item", {
      projectId: 1,
      boardId: 2,
      title: "Task",
      description: "Details",
      categoryId: 3,
      stageId: 4,
      assignedUserId: 5,
      estimatedTime: 2,
      dueDate: "2026-04-01",
      tags: ["bug", "urgent"],
      priorityId: 3,
    });
    const body = lastBody();
    assert.equal(body.description, "Details");
    assert.equal(body.categoryId, 3);
    assert.equal(body.stageId, 4);
    assert.equal(body.assignedUserId, 5);
    assert.equal(body.estimatedTime, 2);
    assert.equal(body.dueDate, "2026-04-01");
    assert.deepEqual(body.tags, ["bug", "urgent"]);
    assert.equal(body.priorityId, 3);
  });

  it("does not include projectId in the request body", async () => {
    await handleTool("create_work_item", { projectId: 42, boardId: 7, title: "Task" });
    assert.equal(lastBody().projectId, undefined);
  });

  it("sends the Authorization header with the API key", async () => {
    await handleTool("create_work_item", { projectId: 1, boardId: 2, title: "Task" });
    assert.equal(lastRequest.opts.headers.Authorization, "ApiKey test-api-key");
  });

  it("sends Content-Type: application/json", async () => {
    await handleTool("create_work_item", { projectId: 1, boardId: 2, title: "Task" });
    assert.equal(lastRequest.opts.headers["Content-Type"], "application/json");
  });

  it("throws on API error response", async () => {
    globalThis.fetch = async () => ({
      ok: false,
      status: 400,
      text: async () => "Bad Request",
    });
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

// ── Smoke tests for other tools ──────────────────────────────────────────────

describe("list_projects", () => {
  beforeEach(() => mockFetch());

  it("sends GET to /projects", async () => {
    await handleTool("list_projects", {});
    assert.equal(lastRequest.opts.method, "GET");
    assert.equal(lastURL().pathname, "/v0/projects");
  });

  it("forwards limit and offset as query params", async () => {
    await handleTool("list_projects", { limit: 10, offset: 20 });
    const params = lastURL().searchParams;
    assert.equal(params.get("limit"), "10");
    assert.equal(params.get("offset"), "20");
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
    assert.equal(body.title, "Updated");
  });
});

describe("delete_work_item", () => {
  beforeEach(() => mockFetch({ ok: true, status: 204, json: async () => null, text: async () => "" }));

  it("sends DELETE to /projects/{projectId}/workitems/{workItemId}", async () => {
    await handleTool("delete_work_item", { projectId: 1, workItemId: 5 });
    assert.equal(lastRequest.opts.method, "DELETE");
    assert.equal(lastURL().pathname, "/v0/projects/1/workitems/5");
  });
});

describe("unknown tool", () => {
  it("throws for an unrecognized tool name", async () => {
    await assert.rejects(
      () => handleTool("nonexistent_tool", {}),
      /Unknown tool: nonexistent_tool/
    );
  });
});

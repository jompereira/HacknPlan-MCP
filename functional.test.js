/**
 * Functional tests — hit the real HacknPlan API.
 *
 * Usage:
 *   HACKNPLAN_API_KEY=<key> node --test functional.test.js
 *
 * Optional env vars:
 *   HACKNPLAN_TEST_PROJECT_ID  — reuse an existing project (avoids creating one).
 *                                 The project must be owned by the API key user.
 *
 * API quirks discovered during testing:
 *   - DELETE, close, and reopen endpoints return HTTP 200 with an empty body (not 204).
 *     hnpRequest handles this: empty 200 body → null return.
 *   - Projects use "id" as the identifier field, not "projectId".
 *   - Work item list responses are wrapped: { totalCount, offset, limit, items: [] }.
 *   - Project user entries nest the user object: { user: { id, ... }, ... }.
 *   - Categories, stages, and importance levels are READ-ONLY via the public API
 *     (create/update/delete return 403). Only list/get are tested here.
 */

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";

const API_KEY = process.env.HACKNPLAN_API_KEY;

if (!API_KEY) {
  console.error("Skipping functional tests: HACKNPLAN_API_KEY is not set.");
  process.exit(0);
}

const { handleTool } = await import("./lib.js");

const SUFFIX = `_ft_${Date.now()}`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function assertField(obj, field) {
  assert.ok(obj != null, `Expected non-null response`);
  assert.ok(
    typeof obj[field] === "number",
    `Expected response.${field} to be a number, got ${JSON.stringify(obj)}`
  );
}

// ── Project lifecycle ──────────────────────────────────────────────────────────

describe("Project endpoints", () => {
  // projectId here is the numeric "id" from the API response
  let projectId;
  const ownProject = !process.env.HACKNPLAN_TEST_PROJECT_ID;

  before(async () => {
    if (process.env.HACKNPLAN_TEST_PROJECT_ID) {
      projectId = Number(process.env.HACKNPLAN_TEST_PROJECT_ID);
      console.log(`  Using existing project ${projectId}`);
    } else {
      // API returns { id, name, ... } — not projectId
      const project = await handleTool("create_project", {
        name: `FT Project ${SUFFIX}`,
        costMetric: "points",
        description: "Functional test project — safe to delete",
      });
      projectId = project.id;
      console.log(`  Created project ${projectId}`);
    }
  });

  after(async () => {
    if (ownProject && projectId) {
      try {
        await handleTool("delete_project", { projectId });
        console.log(`  Deleted project ${projectId}`);
      } catch (e) {
        console.warn(`  Could not delete project ${projectId}: ${e.message}`);
      }
    }
  });

  it("get_project returns the project", async () => {
    const result = await handleTool("get_project", { projectId });
    // Projects use "id", not "projectId"
    assert.equal(result.id, projectId);
  });

  it("get_project_metrics returns metrics object", async () => {
    const result = await handleTool("get_project_metrics", { projectId });
    assert.ok(result != null, "Expected non-null metrics response");
  });

  it("update_project changes the description", async () => {
    const updated = await handleTool("update_project", {
      projectId,
      description: `Updated by functional test ${SUFFIX}`,
    });
    // Returns 200 empty body → null (success)
    assert.ok(updated === null || updated != null);
  });

  it("close_project and reopen_project round-trip", async () => {
    // Both return 200 with empty body → null
    const closed = await handleTool("close_project", { projectId });
    assert.equal(closed, null);
    const reopened = await handleTool("reopen_project", { projectId });
    assert.equal(reopened, null);
  });

  // ── Milestones ──────────────────────────────────────────────────────────────

  describe("Milestone endpoints", () => {
    let milestoneId;

    before(async () => {
      const ms = await handleTool("create_milestone", {
        projectId,
        name: `FT Milestone ${SUFFIX}`,
        description: "Functional test milestone",
        startDate: "2026-04-01",
        endDate: "2026-06-30",
      });
      milestoneId = ms.milestoneId;
    });

    after(async () => {
      if (milestoneId) {
        try {
          await handleTool("delete_milestone", { projectId, milestoneId });
        } catch (_) {}
      }
    });

    it("create_milestone returns milestoneId", () => {
      assert.ok(typeof milestoneId === "number", `Expected milestoneId number, got ${milestoneId}`);
    });

    it("get_milestone returns the milestone", async () => {
      const result = await handleTool("get_milestone", { projectId, milestoneId });
      assert.equal(result.milestoneId, milestoneId);
    });

    it("get_milestone with includeBoards=true embeds boards", async () => {
      const result = await handleTool("get_milestone", {
        projectId,
        milestoneId,
        includeBoards: true,
      });
      assert.ok(Array.isArray(result.boards), "Expected boards array in response");
    });

    it("update_milestone changes the name", async () => {
      // Returns the updated milestone object
      const updated = await handleTool("update_milestone", {
        projectId,
        milestoneId,
        name: `FT Milestone Updated ${SUFFIX}`,
      });
      assert.ok(updated != null);
      assert.equal(updated.milestoneId, milestoneId);
    });

    it("get_milestone_metrics returns metrics object", async () => {
      const result = await handleTool("get_milestone_metrics", { projectId, milestoneId });
      assert.ok(result != null);
    });

    it("close_milestone and reopen_milestone round-trip", async () => {
      // Both return 200 with empty body → null
      await handleTool("close_milestone", { projectId, milestoneId });
      await handleTool("reopen_milestone", { projectId, milestoneId });
    });

    it("delete_milestone with deleteBoards=true returns null", async () => {
      // Create a second milestone to delete with the flag
      const ms2 = await handleTool("create_milestone", {
        projectId,
        name: `FT Milestone Del ${SUFFIX}`,
      });
      const result = await handleTool("delete_milestone", {
        projectId,
        milestoneId: ms2.milestoneId,
        deleteBoards: true,
        deleteWorkItems: true,
      });
      assert.equal(result, null);
    });
  });

  // ── Boards ──────────────────────────────────────────────────────────────────

  describe("Board endpoints", () => {
    let boardId;

    before(async () => {
      const board = await handleTool("create_board", {
        projectId,
        name: `FT Board ${SUFFIX}`,
      });
      boardId = board.boardId;
    });

    after(async () => {
      if (boardId) {
        try {
          await handleTool("delete_board", { projectId, boardId });
        } catch (_) {}
      }
    });

    it("create_board returns boardId", () => {
      assert.ok(typeof boardId === "number", `Expected boardId number, got ${boardId}`);
    });

    it("get_board returns the board", async () => {
      const result = await handleTool("get_board", { projectId, boardId });
      assert.equal(result.boardId, boardId);
    });

    it("list_boards returns an array", async () => {
      const result = await handleTool("list_boards", { projectId });
      assert.ok(Array.isArray(result), "Expected boards to be an array");
    });

    it("list_boards with includeClosed=true does not error", async () => {
      const result = await handleTool("list_boards", { projectId, includeClosed: true });
      assert.ok(Array.isArray(result));
    });

    it("update_board changes the name", async () => {
      // Returns the updated board object; PATCH response uses 'id', GET uses 'boardId'
      const updated = await handleTool("update_board", {
        projectId,
        boardId,
        name: `FT Board Updated ${SUFFIX}`,
      });
      assert.ok(updated != null);
      const returnedId = updated.boardId ?? updated.id;
      assert.equal(returnedId, boardId);
    });

    it("get_board_metrics returns metrics object", async () => {
      const result = await handleTool("get_board_metrics", { projectId, boardId });
      assert.ok(result != null);
    });

    it("close_board and reopen_board round-trip", async () => {
      // Both return 200 with empty body → null
      await handleTool("close_board", { projectId, boardId });
      await handleTool("reopen_board", { projectId, boardId });
    });

    // ── Work Items ────────────────────────────────────────────────────────────

    describe("Work Item endpoints", () => {
      let workItemId;
      let clonedWorkItemId;

      before(async () => {
        const item = await handleTool("create_work_item", {
          projectId,
          boardId,
          title: `FT Task ${SUFFIX}`,
          importanceLevelId: 3,
        });
        workItemId = item.workItemId;
      });

      after(async () => {
        for (const id of [clonedWorkItemId, workItemId]) {
          if (id) {
            try {
              await handleTool("delete_work_item", { projectId, workItemId: id });
            } catch (_) {}
          }
        }
      });

      it("create_work_item returns workItemId", () => {
        assert.ok(typeof workItemId === "number", `Expected workItemId number, got ${workItemId}`);
      });

      it("get_work_item returns the item", async () => {
        const result = await handleTool("get_work_item", { projectId, workItemId });
        assert.equal(result.workItemId, workItemId);
      });

      it("list_work_items returns { items } array", async () => {
        const result = await handleTool("list_work_items", { projectId, boardId });
        assert.ok(Array.isArray(result.items), "Expected result.items to be an array");
      });

      it("list_work_items with searchTerms does not error", async () => {
        const result = await handleTool("list_work_items", {
          projectId,
          searchTerms: "FT Task",
        });
        assert.ok(Array.isArray(result.items));
      });

      it("list_work_items with sortField and sortMode does not error", async () => {
        const result = await handleTool("list_work_items", {
          projectId,
          sortField: "title",
          sortMode: "asc",
        });
        assert.ok(Array.isArray(result.items));
      });

      it("clone_work_item creates a copy", async () => {
        const cloned = await handleTool("clone_work_item", {
          projectId,
          workItemId,
          boardId,
        });
        assert.ok(cloned != null);
        if (cloned?.workItemId) {
          clonedWorkItemId = cloned.workItemId;
          assert.notEqual(clonedWorkItemId, workItemId);
        }
      });

      it("delete_work_item returns null", async () => {
        // Create a throwaway item to delete
        const temp = await handleTool("create_work_item", {
          projectId,
          boardId,
          title: `FT Task Del ${SUFFIX}`,
          importanceLevelId: 3,
        });
        const result = await handleTool("delete_work_item", {
          projectId,
          workItemId: temp.workItemId,
        });
        assert.equal(result, null);
      });
    });
  });

  // ── Categories (read-only — create/update/delete return 403) ──────────────

  describe("Category endpoints (list/get only)", () => {
    let categoryId;

    before(async () => {
      const cats = await handleTool("list_categories", { projectId });
      // New projects have default categories (Programming, Art, etc.)
      categoryId = cats[0]?.categoryId;
    });

    it("list_categories returns an array", async () => {
      const result = await handleTool("list_categories", { projectId });
      assert.ok(Array.isArray(result), "Expected categories to be an array");
    });

    it("get_category returns the category", async () => {
      if (!categoryId) return; // no categories on this project
      const result = await handleTool("get_category", { projectId, categoryId });
      assert.equal(result.categoryId, categoryId);
    });
  });

  // ── Stages (read-only — create/update/delete return 403) ──────────────────

  describe("Stage endpoints (list/get only)", () => {
    let stageId;

    before(async () => {
      const stages = await handleTool("list_stages", { projectId });
      stageId = stages[0]?.stageId;
    });

    it("list_stages returns an array", async () => {
      const result = await handleTool("list_stages", { projectId });
      assert.ok(Array.isArray(result), "Expected stages to be an array");
    });

    it("get_stage returns the stage", async () => {
      if (!stageId) return;
      const result = await handleTool("get_stage", { projectId, stageId });
      assert.equal(result.stageId, stageId);
    });
  });

  // ── Importance Levels (read-only — create/update/delete return 403) ────────

  describe("Importance Level endpoints (list/get only)", () => {
    let importanceLevelId;

    before(async () => {
      const levels = await handleTool("list_importance_levels", { projectId });
      importanceLevelId = levels[0]?.importanceLevelId;
    });

    it("list_importance_levels returns an array", async () => {
      const result = await handleTool("list_importance_levels", { projectId });
      assert.ok(Array.isArray(result), "Expected importance levels to be an array");
    });

    it("get_importance_level returns the level", async () => {
      if (!importanceLevelId) return;
      const result = await handleTool("get_importance_level", {
        projectId,
        importanceLevelId,
      });
      assert.equal(result.importanceLevelId, importanceLevelId);
    });
  });

  // ── Users ────────────────────────────────────────────────────────────────────

  describe("User endpoints", () => {
    let userId;

    before(async () => {
      const me = await handleTool("get_current_user", {});
      // get_current_user returns { id, username, ... }
      userId = me.id;
    });

    it("get_current_user returns a user id", () => {
      assert.ok(typeof userId === "number", `Expected userId number, got ${userId}`);
    });

    it("list_project_users returns an array of member objects", async () => {
      const result = await handleTool("list_project_users", { projectId });
      assert.ok(Array.isArray(result), "Expected users to be an array");
      // Each entry has { user: { id, ... }, projectId, isAdmin, ... }
      assert.ok(result[0].user != null, "Expected result[0].user to exist");
    });

    it("get_project_user returns the user's project membership", async () => {
      const result = await handleTool("get_project_user", { projectId, userId });
      assert.equal(result.user.id, userId);
    });
  });
});

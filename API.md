# HacknPlan API Reference

**Base URL:** `https://api.hacknplan.com/v0`
**Rate limit:** 5 requests/second (public beta)

> **MCP coverage note:** Endpoints marked ⬜ are not currently implemented in this MCP server. All others are implemented.

---

## Authentication

Every request requires an `Authorization` header:

```
Authorization: ApiKey <your_api_key>
Content-Type: application/json
```

---

## Projects

### List projects
```
GET /projects?limit=20&offset=0
```

| Param | Type | Description |
|---|---|---|
| `limit` | number | Max results (default 20, max 100) |
| `offset` | number | Pagination offset |

### Get project
```
GET /projects/{projectId}
```

### Create project
```
POST /projects
```
```json
{
  "name": "My Game",
  "costMetric": "points",
  "description": "Optional description"
}
```

Required: `name`, `costMetric`. `costMetric` must be `"points"` or `"hours"`.

### Update project (partial)
```
PATCH /projects/{projectId}
```
```json
{
  "name": "New Name",
  "description": "Updated description"
}
```

All fields optional. Only provided fields are updated.

### Update project (full)
```
PUT /projects/{projectId}
```
Full replacement — all fields required (`name`, `costMetric`, optional `description`).

### Delete project
```
DELETE /projects/{projectId}
```

### Change project owner
```
PUT /projects/{projectId}/owner
```
```json
{ "userId": 42 }
```

### Close project
```
POST /projects/{projectId}/closure
```
Archives the project (does not delete it). Returns `200` with empty body.

### Reopen project
```
DELETE /projects/{projectId}/closure
```
Returns `200` with empty body.

### Get project metrics
```
GET /projects/{projectId}/metrics
```
Returns progress/burndown data for the project.

---

## Boards

### List boards
```
GET /projects/{projectId}/boards?includeClosed=false
```

| Param | Type | Description |
|---|---|---|
| `includeClosed` | boolean | Include archived boards (default `false`) |

### Get board
```
GET /projects/{projectId}/boards/{boardId}
```

### Create board
```
POST /projects/{projectId}/boards
```
```json
{
  "name": "Programming",
  "milestoneId": 12
}
```
`milestoneId` is optional.

### Update board (partial)
```
PATCH /projects/{projectId}/boards/{boardId}
```
Returns the updated board object.

### Update board (full)
```
PUT /projects/{projectId}/boards/{boardId}
```
Full replacement — `name` required, `milestoneId` optional.

### Delete board
```
DELETE /projects/{projectId}/boards/{boardId}?removeWorkItems=false
```

| Param | Type | Description |
|---|---|---|
| `removeWorkItems` | boolean | Also delete all work items on this board (default `false`) |

Returns `200`.

### Close board
```
POST /projects/{projectId}/boards/{boardId}/closure
```
Archives the board without deleting it. Returns `200` with empty body.
**Note:** Must send an empty JSON body `{}` — API rejects POST with no body.

### Reopen board
```
DELETE /projects/{projectId}/boards/{boardId}/closure
```
Returns `200` with empty body.

### Set default board
```
POST /projects/{projectId}/boards/default
```
```json
{ "boardId": 7 }
```

### Clear default board
```
DELETE /projects/{projectId}/boards/default
```

### Get board metrics
```
GET /projects/{projectId}/boards/{boardId}/metrics
```

---

## Milestones

### List milestones
```
GET /projects/{projectId}/milestones
```

### Get milestone
```
GET /projects/{projectId}/milestones/{milestoneId}?includeBoards=false
```

| Param | Type | Description |
|---|---|---|
| `includeBoards` | boolean | Embed associated boards in the response (default `false`) |

### Create milestone
```
POST /projects/{projectId}/milestones
```
```json
{
  "name": "Alpha",
  "description": "Optional",
  "startDate": "2026-04-01",
  "endDate": "2026-06-30"
}
```
`startDate` and `endDate` are ISO 8601 strings and optional.

### Update milestone (partial)
```
PATCH /projects/{projectId}/milestones/{milestoneId}
```
All fields optional. Same fields as create. Returns the updated milestone object.

### Update milestone (full)
```
PUT /projects/{projectId}/milestones/{milestoneId}
```
Full replacement — `name` required, other fields optional.

### Delete milestone
```
DELETE /projects/{projectId}/milestones/{milestoneId}?deleteBoards=false&deleteWorkItems=false
```

| Param | Type | Description |
|---|---|---|
| `deleteBoards` | boolean | Also delete all boards in this milestone (default `false`) |
| `deleteWorkItems` | boolean | Also delete all work items (default `false`) |

Returns `200`.

### Close milestone
```
POST /projects/{projectId}/milestones/{milestoneId}/closure
```
Archives the milestone without deleting it. Returns `200` with empty body.
**Note:** Must send an empty JSON body `{}` — API rejects POST with no body.

### Reopen milestone
```
DELETE /projects/{projectId}/milestones/{milestoneId}/closure
```
Returns `200` with empty body.

### Get milestone metrics
```
GET /projects/{projectId}/milestones/{milestoneId}/metrics
```

---

## Work Items

### List work items
```
GET /projects/{projectId}/workitems?limit=20&offset=0
```

Optional query parameters:

| Param | Type | Description |
|---|---|---|
| `boardId` | number | Filter by board |
| `milestoneId` | number | Filter by milestone |
| `stageId` | number | Filter by stage |
| `categoryId` | number | Filter by category |
| `assignedUserId` | number | Filter by assignee |
| `importanceLevelId` | number | Filter by importance level |
| `parentStoryId` | number | Filter by parent story (returns sub-tasks) |
| `designElementId` | number | Filter by linked design element |
| `isCompleted` | boolean | Filter by completion status |
| `searchTerms` | string | Full-text search across title and description |
| `sortField` | string | Field to sort by |
| `sortMode` | string | `"asc"` or `"desc"` |
| `limit` | number | Max results (default 20, max 100) |
| `offset` | number | Pagination offset |

Response is wrapped: `{ totalCount, offset, limit, items: [] }`.

### Get work item
```
GET /projects/{projectId}/workitems/{workItemId}
```

### Create work item
```
POST /projects/{projectId}/workitems?boardId={boardId}
```
```json
{
  "title": "Implement leaderboard",
  "importanceLevelId": 3,
  "description": "Optional details",
  "isStory": false,
  "parentStoryId": 7,
  "categoryId": 3,
  "stageId": 4,
  "assignedUserId": 5,
  "estimatedTime": 4,
  "dueDate": "2026-05-01",
  "tags": ["feature", "backend"]
}
```

Required: `boardId` (query param, not body), `title`, `importanceLevelId`.

| Field | Notes |
|---|---|
| `boardId` | Query param only — not in the request body |
| `importanceLevelId` | Required by API. MCP defaults to `3` (Normal). Use `list_importance_levels` for project-specific values |
| `isStory` | `true` for user stories, `false` for tasks (default) |
| `parentStoryId` | ID of parent story when creating a sub-task |
| `estimatedTime` | Hours |
| `stageId` | **Silently ignored on POST.** The MCP automatically issues a follow-up PATCH to set the stage when this field is provided |

### Update work item
```
PATCH /projects/{projectId}/workitems/{workItemId}
```
All fields optional. Same fields as create, plus `isCompleted` (boolean).

### Clone work item
```
POST /projects/{projectId}/workitems/{workItemId}?boardId={boardId}
```
Creates a copy of an existing work item. `boardId` is optional — defaults to the same board.

### Delete work item
```
DELETE /projects/{projectId}/workitems/{workItemId}
```
Returns `200` with empty body.

---

## Work Item Attachments

Attachments are read/deleted via JSON but must be **uploaded** with `multipart/form-data`.

### List attachments
```
GET /projects/{projectId}/workitems/{workItemId}/attachments
```

### ⬜ Upload attachment
```
POST /projects/{projectId}/workitems/{workItemId}/attachments
```
Content-Type: `multipart/form-data` — not supported by this MCP server.

### Get attachment
```
GET /projects/{projectId}/workitems/{workItemId}/attachments/{attachmentId}
```

### ⬜ Update attachment
```
PUT /projects/{projectId}/workitems/{workItemId}/attachments/{attachmentId}
```
Content-Type: `multipart/form-data` — not supported by this MCP server.

### Delete attachment
```
DELETE /projects/{projectId}/workitems/{workItemId}/attachments/{attachmentId}
```

---

## Importance Levels

> **API restriction:** Create/update/delete endpoints return `403` for most accounts. Importance levels appear to be read-only via the public API. The MCP implements these endpoints but expect `403` in practice.

### List importance levels
```
GET /projects/{projectId}/importancelevels
```
Returns project-specific importance levels with their IDs. Default values are `1` Urgent · `2` High · `3` Normal · `4` Low, but IDs may vary per project.

### Get importance level
```
GET /projects/{projectId}/importancelevels/{importanceLevelId}
```

### Create importance level
```
POST /projects/{projectId}/importancelevels
```
```json
{ "name": "Critical", "description": "Optional" }
```

### Update importance level (partial)
```
PATCH /projects/{projectId}/importancelevels/{importanceLevelId}
```

### ⬜ Update importance level (full)
```
PUT /projects/{projectId}/importancelevels/{importanceLevelId}
```

### Delete importance level
```
DELETE /projects/{projectId}/importancelevels/{importanceLevelId}
```

---

## Categories

> **API restriction:** Create/update/delete endpoints return `403` for most accounts. The MCP implements these endpoints but expect `403` in practice.

### List categories
```
GET /projects/{projectId}/categories
```

### Get category
```
GET /projects/{projectId}/categories/{categoryId}
```

### Create category
```
POST /projects/{projectId}/categories
```
```json
{ "name": "Programming", "description": "Optional" }
```

### Update category (partial)
```
PATCH /projects/{projectId}/categories/{categoryId}
```

### ⬜ Update category (full)
```
PUT /projects/{projectId}/categories/{categoryId}
```

### Delete category
```
DELETE /projects/{projectId}/categories/{categoryId}
```

---

## Stages

> **API restriction:** Create/update/delete endpoints return `403` for most accounts. The MCP implements these endpoints but expect `403` in practice.

### List stages
```
GET /projects/{projectId}/stages
```

### Get stage
```
GET /projects/{projectId}/stages/{stageId}
```

### Create stage
```
POST /projects/{projectId}/stages
```
```json
{ "name": "In Progress", "description": "Optional" }
```

### Update stage (partial)
```
PATCH /projects/{projectId}/stages/{stageId}
```

### ⬜ Update stage (full)
```
PUT /projects/{projectId}/stages/{stageId}
```

### Delete stage
```
DELETE /projects/{projectId}/stages/{stageId}
```

---

## Users

### Get current user
```
GET /users/me
```
Returns `{ id, username, ... }`.

### List project users
```
GET /projects/{projectId}/users
```
Each entry has `{ user: { id, ... }, projectId, isAdmin, ... }`.

### Get project user
```
GET /projects/{projectId}/users/{userId}
```
Returns the user's project membership details including permissions.

### Add user to project
```
POST /projects/{projectId}/users
```
```json
{ "userId": 42, "roleId": 3, "isAdmin": false }
```

### Update project user (partial)
```
PATCH /projects/{projectId}/users/{userId}
```
```json
{ "roleId": 5, "isAdmin": true, "isActive": true }
```

### Update project user (full)
```
PUT /projects/{projectId}/users/{userId}
```
Full replacement — same fields as partial update.

### Add team to project
```
POST /projects/{projectId}/teams
```
```json
{ "teamId": 12, "roleId": 3 }
```

---

## Project Roles

### List roles
```
GET /projects/{projectId}/roles
```

### Create role
```
POST /projects/{projectId}/roles
```
```json
{ "name": "Developer", "description": "Optional" }
```

### Get role
```
GET /projects/{projectId}/roles/{roleId}
```

### Update role (partial)
```
PATCH /projects/{projectId}/roles/{roleId}
```

### Update role (full)
```
PUT /projects/{projectId}/roles/{roleId}
```
`name` required.

### Delete role
```
DELETE /projects/{projectId}/roles/{roleId}
```

---

## Project Tags

### List tags
```
GET /projects/{projectId}/tags
```

### Create tag
```
POST /projects/{projectId}/tags
```
```json
{ "name": "bug", "color": "#FF0000" }
```
`color` is an optional hex color code.

### Update tag (partial)
```
PATCH /projects/{projectId}/tags/{tagId}
```

### Update tag (full)
```
PUT /projects/{projectId}/tags/{tagId}
```
`name` required.

### Delete tag
```
DELETE /projects/{projectId}/tags/{tagId}
```

---

## Design Elements (GDD)

Design elements represent Game Design Document entries linked to work items (e.g., concept art, feature specs, wireframes).

### List design elements
```
GET /projects/{projectId}/designelements?typeId={typeId}&limit=20&offset=0
```

| Param | Type | Description |
|---|---|---|
| `typeId` | number | Filter by design element type (optional) |
| `limit` | number | Max results |
| `offset` | number | Pagination offset |

### Create design element
```
POST /projects/{projectId}/designelements
```
```json
{
  "name": "Combat System",
  "typeId": 2,
  "description": "Optional",
  "startDate": "2026-04-01",
  "endDate": "2026-06-30"
}
```
`typeId` is required. Use `list_design_element_types` to get available types.

### Get design element
```
GET /projects/{projectId}/designelements/{designElementId}
```

### Update design element (partial)
```
PATCH /projects/{projectId}/designelements/{designElementId}
```

### Update design element (full)
```
PUT /projects/{projectId}/designelements/{designElementId}
```
`name` and `typeId` required.

### Delete design element
```
DELETE /projects/{projectId}/designelements/{designElementId}
```

### Get design element metrics
```
GET /projects/{projectId}/designelements/{designElementId}/metrics
```

---

## Design Element Attachments

### List attachments
```
GET /projects/{projectId}/designelements/{designElementId}/attachments
```

### ⬜ Upload attachment
```
POST /projects/{projectId}/designelements/{designElementId}/attachments
```
Content-Type: `multipart/form-data` — not supported by this MCP server.

### Get attachment
```
GET /projects/{projectId}/designelements/{designElementId}/attachments/{attachmentId}
```

### ⬜ Update attachment
```
PUT /projects/{projectId}/designelements/{designElementId}/attachments/{attachmentId}
```
Content-Type: `multipart/form-data` — not supported by this MCP server.

### Delete attachment
```
DELETE /projects/{projectId}/designelements/{designElementId}/attachments/{attachmentId}
```

---

## Design Element Comments

### List comments
```
GET /projects/{projectId}/designelements/{designElementId}/comments
```

### Create comment
```
POST /projects/{projectId}/designelements/{designElementId}/comments
```
```json
{ "text": "This looks great!" }
```

### Update comment
```
PUT /projects/{projectId}/designelements/{designElementId}/comments/{commentId}
```
```json
{ "text": "Updated text" }
```
Full replacement — `text` required.

### Delete comment
```
DELETE /projects/{projectId}/designelements/{designElementId}/comments/{commentId}
```

---

## Design Element Types

### List design element types
```
GET /projects/{projectId}/designelementtypes
```

### Create design element type
```
POST /projects/{projectId}/designelementtypes
```
```json
{ "name": "Feature Spec", "description": "Optional" }
```

### Get design element type
```
GET /projects/{projectId}/designelementtypes/{designElementTypeId}
```

### Update design element type (partial)
```
PATCH /projects/{projectId}/designelementtypes/{designElementTypeId}
```

### Update design element type (full)
```
PUT /projects/{projectId}/designelementtypes/{designElementTypeId}
```
`name` required.

### Delete design element type
```
DELETE /projects/{projectId}/designelementtypes/{designElementTypeId}
```

---

## Events & Files

### List project events
```
GET /projects/{projectId}/events?limit=20&offset=0
```
Returns the activity log for the project.

### List project files
```
GET /projects/{projectId}/files
```

### ⬜ Upload file
```
POST /projects/{projectId}/files
```
Content-Type: `multipart/form-data` — not supported by this MCP server.

### Delete file
```
DELETE /projects/{projectId}/files/{fileId}
```

### Get storage usage
```
GET /projects/{projectId}/storage
```
Returns current file storage quota and usage.

---

## Webhooks

### List webhook event types
```
GET /webhookevents
```
Returns all available event type strings that can be subscribed to.

### List webhooks
```
GET /projects/{projectId}/webhooks
```

### Create webhook
```
POST /projects/{projectId}/webhooks
```
```json
{
  "url": "https://example.com/webhook",
  "events": ["workitem.created", "workitem.updated"],
  "secret": "optional-signing-secret"
}
```
`url` and `events` are required. Use `list_webhook_event_types` to get valid event names.

### Get webhook
```
GET /projects/{projectId}/webhooks/{webhookId}
```

### Update webhook (partial)
```
PATCH /projects/{projectId}/webhooks/{webhookId}
```

### Update webhook (full)
```
PUT /projects/{projectId}/webhooks/{webhookId}
```
`url` and `events` required.

### Delete webhook
```
DELETE /projects/{projectId}/webhooks/{webhookId}
```

---

## Error Responses

Non-2xx responses return a plain-text body describing the error:

```
HTTP 400 Bad Request
"<error message>"
```

Common status codes:

| Code | Meaning |
|---|---|
| `200` | Success (most endpoints) |
| `204` | Success, no content (some DELETE endpoints) |
| `400` | Bad request — check required fields |
| `401` | Invalid or missing API key |
| `403` | Insufficient permissions (common for categories/stages/importance levels) |
| `404` | Resource not found |
| `429` | Rate limit exceeded (5 req/s) |

---

## curl Examples

```bash
# List projects
curl -H "Authorization: ApiKey $HACKNPLAN_API_KEY" \
  https://api.hacknplan.com/v0/projects

# Create a work item
curl -X POST \
  -H "Authorization: ApiKey $HACKNPLAN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title": "Fix collision bug", "importanceLevelId": 3}' \
  "https://api.hacknplan.com/v0/projects/42/workitems?boardId=7"

# Search work items by text
curl -H "Authorization: ApiKey $HACKNPLAN_API_KEY" \
  "https://api.hacknplan.com/v0/projects/42/workitems?searchTerms=collision&limit=20"

# Mark a work item complete
curl -X PATCH \
  -H "Authorization: ApiKey $HACKNPLAN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"isCompleted": true}' \
  https://api.hacknplan.com/v0/projects/42/workitems/99

# List boards including archived
curl -H "Authorization: ApiKey $HACKNPLAN_API_KEY" \
  "https://api.hacknplan.com/v0/projects/42/boards?includeClosed=true"

# Delete a milestone and all its work items
curl -X DELETE \
  -H "Authorization: ApiKey $HACKNPLAN_API_KEY" \
  "https://api.hacknplan.com/v0/projects/42/milestones/5?deleteBoards=true&deleteWorkItems=true"

# Create a webhook
curl -X POST \
  -H "Authorization: ApiKey $HACKNPLAN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/hook", "events": ["workitem.created"]}' \
  "https://api.hacknplan.com/v0/projects/42/webhooks"
```

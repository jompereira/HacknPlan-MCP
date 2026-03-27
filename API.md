# HacknPlan API Reference

**Base URL:** `https://api.hacknplan.com/v0`
**Rate limit:** 5 requests/second (public beta)

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
  "description": "Optional description"
}
```

### Update project
```
PATCH /projects/{projectId}
```
```json
{
  "name": "New Name",
  "description": "New description"
}
```

---

## Boards

### List boards
```
GET /projects/{projectId}/boards
```

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

---

## Milestones

### List milestones
```
GET /projects/{projectId}/milestones
```

### Get milestone
```
GET /projects/{projectId}/milestones/{milestoneId}
```

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

### Close milestone
```
POST /projects/{projectId}/milestones/{milestoneId}/close
```
No body. Returns `204 No Content`.

### Reopen milestone
```
POST /projects/{projectId}/milestones/{milestoneId}/reopen
```
No body. Returns `204 No Content`.

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
| `stageId` | number | Filter by stage |
| `categoryId` | number | Filter by category |
| `assignedUserId` | number | Filter by assignee |
| `isCompleted` | boolean | Filter by completion status |
| `limit` | number | Max results (default 20, max 100) |
| `offset` | number | Pagination offset |

### Get work item
```
GET /projects/{projectId}/workitems/{workItemId}
```

### Create work item
```
POST /projects/{projectId}/workitems
```
```json
{
  "boardId": 7,
  "title": "Implement leaderboard",
  "description": "Optional details",
  "categoryId": 3,
  "stageId": 4,
  "assignedUserId": 5,
  "estimatedTime": 4,
  "dueDate": "2026-05-01",
  "tags": ["feature", "backend"],
  "priorityId": 3
}
```

Required: `boardId`, `title`.
`priorityId` values: `0` None · `1` Low · `2` Medium · `3` High · `4` Critical.
`estimatedTime` is in hours.

### Update work item
```
PATCH /projects/{projectId}/workitems/{workItemId}
```
All fields are optional. Same fields as create, plus:
```json
{
  "isCompleted": true
}
```

### Delete work item
```
DELETE /projects/{projectId}/workitems/{workItemId}
```
Returns `204 No Content`.

---

## Categories

### List categories
```
GET /projects/{projectId}/categories
```

---

## Stages

### List stages
```
GET /projects/{projectId}/stages
```

---

## Users

### Get current user
```
GET /users/me
```

### List project users
```
GET /projects/{projectId}/users
```

---

## Error responses

Non-2xx responses return a plain text body describing the error:

```
HTTP 400 Bad Request
"<error message>"
```

## curl examples

```bash
# List projects
curl -H "Authorization: ApiKey $HACKNPLAN_API_KEY" \
  https://api.hacknplan.com/v0/projects

# Create a work item
curl -X POST \
  -H "Authorization: ApiKey $HACKNPLAN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"boardId": 7, "title": "Fix collision bug", "priorityId": 3}' \
  https://api.hacknplan.com/v0/projects/42/workitems

# Mark a work item complete
curl -X PATCH \
  -H "Authorization: ApiKey $HACKNPLAN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"isCompleted": true}' \
  https://api.hacknplan.com/v0/projects/42/workitems/99
```

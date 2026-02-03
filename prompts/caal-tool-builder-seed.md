# CAAL Tool Builder

You are building tools for the [CAAL Tool API](https://github.com/CoreWorxLab/caal/wiki/CAAL-Tool-API) - n8n workflows that CAAL (a voice assistant) discovers and executes via MCP (Model Context Protocol).

## Research Before Building

1. **Check existing tools** - Search `caal-tools/tools/` for similar tools to understand patterns and n8n structure
2. **WebSearch for the correct API endpoint** - Always verify the exact endpoint for the requested functionality. Don't assume similar tools use the same endpoint (e.g., scores ≠ schedule)
3. **Test with curl** - Before building, use `curl` to hit the API and see the actual response structure
4. **WebFetch for API docs** if needed for parameters

**Never create mock data** - use real HTTP requests to real, verified endpoints

## Workflow Creation Rules

You are creating a **BRAND NEW workflow from scratch**, not updating an existing one.

**Do NOT include these fields:** `createdAt`, `updatedAt`, `id`, `lastExecuted`, `versionId`, `staticData`, `tags`, `pinData`, `active`, `meta`

**Settings block - ONLY include:**
```json
"settings": {
  "availableInMCP": true
}
```
Do NOT add other settings like `executionOrder`, `saveManualExecutions`, `callerPolicy`, `timezone`, `executionTimeout`, etc. These cause API errors.

**Return format:**
1. Save the workflow JSON to `n8n-workflows/[workflow_name].json` (e.g., `espn_get_nhl_scores.json`)
2. The JSON must include: `name`, `nodes`, `settings`, `connections`
3. Under settings, set `availableInMCP: true`
4. Output the complete workflow JSON in a ```json code fence
5. Output a short voice message in a ```announcement code fence (plain text, no markdown)

**Example output structure:**
```json
{ "name": "espn_get_nfl_scores", ... }
```

```announcement
I've created espn get nfl scores. I can now check live NFL scores for you.
```

**Voice confirmation examples:**
- "I've created espn get nfl scores. I can now check live NFL scores for you."
- "Done. I built a weather lookup tool - just ask me about the weather anytime."
- "New tool ready: calendar create event. I can now add events to your calendar."

## Naming Convention

**First, determine if this is a Tool Suite or Individual Tool.**

### Tool Suite (Preferred for Related Actions)
A **Tool Suite** is a single workflow that handles multiple related actions via a Switch node.

**Naming:** `service` (snake_case) - just the service name
- `google_tasks` - handles get, add, complete, delete
- `truenas` - handles get, control for pools, apps, services
- `espn_nhl` - handles scores, schedule, standings, roster

### Individual Tool
For single-purpose tools that don't fit a suite pattern.

**Naming:** `service_action_object` (snake_case)
- `weather_get_forecast`
- `date_calculate_days_until`
- `radarr_search_movies`

### When to Use Each

**Use Tool Suite when:**
- Multiple related actions on the same service (CRUD operations)
- Actions share credentials and error handling
- Natural grouping (e.g., all Google Tasks operations)

**Use Individual Tool when:**
- Single, focused functionality
- Doesn't fit with other actions
- Standalone utility (e.g., date calculations)

## Webhook Node Requirements

The webhook node **notes section** is the tool description that CAAL's LLM reads to understand how to call the tool. This is critical - the LLM has no strict schema, it learns what arguments to pass by reading this description.

**IMPORTANT:** The description directly affects LLM tool selection. A poorly written description causes the LLM to use web_search instead of your specialized tool, even when your tool is perfect for the query.

### Description Format

The format is flexible - single-line or multiline both work. What matters is the content quality:

```
[What the tool does] - [scope/context].

Parameters:
- param1 (required): description
- param2 (optional, default X): description, usage note

Examples: 'voice query 1', 'voice query 2 (param=value)'
```

For tools with no parameters:
```
[What the tool does] - [scope/context]. No parameters required. Examples: 'voice query 1', 'voice query 2'.
```

### Format Rules

1. **Start broad, then scope** - "Weather tool - forecast and current conditions for Australia" (not "Australian weather tool")
   - **Why:** Overly restrictive descriptions hurt tool selection. The LLM won't use "Australian weather" for "Sydney weather" queries because Sydney doesn't explicitly mention Australia
   - Put scope AFTER the tool type to cast a wider net for matching

2. **List parameters explicitly** - Use exact parameter names the workflow expects
   - `query` not "search term"
   - `team` not "team name"
   - `days` not "number of days"

4. **Mark required vs optional** - `(required)` or `(optional)` after each param name

5. **Include defaults** - `(optional, default 7)` for optional params with defaults

6. **Add usage notes for ambiguous params** - Especially when multiple params serve similar purposes
   - Example: `days (optional, default 7) - forecast days ahead, use for 'next week' queries; target_day (optional) - specific weekday like 'Monday', use only for 'on Friday' queries`
   - This prevents LLM from passing `target_day="next week"` when it should use `days=7`

7. **End with examples** - 2-3 voice queries with parameter hints when helpful
   - Show natural language → parameter mapping: `'Melbourne next week' (days=7)`

### Parameter Naming

Use the exact JSON key names the workflow code expects:
- `query` not "search term"
- `team` not "team name"
- `days` not "number of days"

The LLM will generate `{"query": "Inception"}` because it read `query` in the description.

### Examples

**Good - Weather tool (broad → scoped, parameter disambiguation):**
```
Weather tool - forecast and current conditions for Australia.

Parameters:
- action (required): 'forecast' or 'current'
- location (required): city, suburb, or postcode
- days (optional, default 7): forecast days ahead (1-7), use for 'next week' queries
- target_day (optional): specific weekday like 'Monday', use only for 'on Friday' style queries

Examples: 'Sydney weather', 'Melbourne next week' (days=7), 'Brisbane Thursday' (target_day='Thursday')
```
**Why it's good:** Starts broad ("Weather tool"), scopes to Australia, disambiguates `days` vs `target_day` with usage notes, shows natural language mapping in examples.

**Good - Sports scores (optional param):**
```
NFL scores - live game results and final scores.

Parameters:
- team (optional): team name like 'Packers', 'Chiefs' to filter results

Examples: 'NFL scores', 'how are the Packers doing', 'did the Chiefs win'
```

**Good - Task suite (multi-action):**
```
Task management suite - Google Tasks integration.

Parameters:
- action (required): 'get', 'add', 'complete', or 'delete'
- title (required for add): task name
- task_id (required for complete/delete): task ID
- notes (optional for add): task notes
- due (optional for add): YYYY-MM-DD

Examples: 'what's on my task list', 'add task buy groceries', 'mark done the groceries task'
```

**Good - Calendar events (format hints):**
```
Calendar events - get scheduled events for date range.

Parameters:
- start_date (required): YYYY-MM-DD format
- end_date (required): YYYY-MM-DD format, EXCLUSIVE (for a single day, set to NEXT day)

Example: for January 16th events, use start_date=2026-01-16, end_date=2026-01-17
```

**Good - No parameters:**
```
Server system status - TrueNAS integration for CPU, memory, storage pools, and running apps. No parameters required.

Examples: 'TrueNAS status', 'how's my server doing'
```

**Good - Complex params with valid values:**
```
Server app control - TrueNAS integration for managing applications.

Parameters:
- app_name (required): app name like 'radarr' or 'jellyfin'
- action (required): 'start', 'stop', or 'restart'

Examples: 'restart Plex', 'stop Jellyfin on my server'
```

**Bad - Too restrictive (hurts tool selection):**
```
Australian weather tool - get weather data. [...]
```
**Why it's bad:** LLM thinks this only applies when user says "Australia". Won't match "Sydney weather" queries. Should be "Weather tool - [for Australia]".

**Bad - Vague, no param names:**
```
Search for movies. Give it a search term.
```

**Bad - Missing required/optional:**
```
Add a task with a title and maybe a due date.
```

**Bad - Ambiguous parameters without usage notes:**
```
Weather forecast. Parameters: days (optional), target_day (optional). [...]
```
**Why it's bad:** LLM doesn't know when to use `days` vs `target_day`. Might pass `target_day="next week"` instead of `days=7`.

### Why This Matters

CAAL uses an LLM-native approach - no JSON schema validation. The LLM reads your description and generates arguments based on what it understands. If you write `query (required)`, the LLM knows to send `{"query": "..."}`. If you're vague, it might send `{"search": "..."}` or `{"term": "..."}` and your workflow breaks.

## Parameterization Notes (For Registry Submission)

When building workflows that may be submitted to the CAAL Tool Registry, add `PARAMETERIZE:` blocks in node notes to help users during installation. This is especially important for nodes with user-specific configuration like database IDs, calendar IDs, or resource locators.

**Format:**
```
PARAMETERIZE:
- fieldName: Description of what this value is
  Find: Where the user can locate this value in the service's UI
  Default: "optional default value" (if applicable)
```

**Example:** A Notion node requiring a database ID:
```json
{
  "name": "Notion Create Task",
  "type": "n8n-nodes-base.notion",
  "notes": "PARAMETERIZE:\n- databaseId: Your Notion database for tasks\n  Find: In URL when viewing database (notion.so/{workspace}/{DATABASE_ID}?v=...)"
}
```

**What to Document:**
- **Database/project IDs** - Notion databases, Todoist projects, Google Calendar IDs
- **Resource locators** - n8n `__rl` fields that reference specific resources
- **API endpoints** - User-specific paths (league IDs, account IDs, etc.)
- **Private URLs** - Local service URLs that vary per user's network

**Why This Matters:**
- The registry LLM extracts hints from these notes during submission
- Users see "where to find" guidance below input fields during tool installation
- Reduces friction and support requests for tool configuration

**Example with multiple fields:**
```
PARAMETERIZE:
- databaseId: Your Notion task database
  Find: In URL when viewing database (notion.so/{workspace}/{DATABASE_ID}?v=...)

- titleProperty: Title column name in your database
  Find: Open database, check the column header name
  Default: "Name" or "Title"
```

## Credentials

Read `CREDENTIALS.md` for available n8n credentials if required.

**Priority order:**
1. Free public APIs (no auth needed)
2. Existing credentials from CREDENTIALS.md
3. Document if new credentials are needed

## n8n 2.0+ Syntax

**Version:** n8n 2.0+ (important for syntax differences)

**Code node syntax:** Use `$input.item.json` (NOT `$input.first().json` from v1.x)

**Webhook Node:**
```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "service_action_object",
    "responseMode": "responseNode"
  },
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2,
  "webhookId": "service_action_object"
}
```

**IMPORTANT:**
- Always include `"httpMethod": "POST"` explicitly. If omitted, n8n defaults to GET which breaks CAAL tool calls.
- Always include `"webhookId"` matching the path. Without this, the webhook won't register properly via API.

**Code Node:**
```javascript
const data = $input.item.json;
// Process and format for voice
return { message: "Brief voice-friendly response" };
```

**HTTP Request Node:**
```json
{
  "parameters": {
    "method": "GET",
    "url": "https://api.example.com/endpoint"
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2
}
```

**Respond to Webhook Node:**
```json
{
  "parameters": {},
  "type": "n8n-nodes-base.respondToWebhook",
  "typeVersion": 1.1
}
```

## Defensive Input Parsing

LLMs format tool call arguments inconsistently. **Always handle multiple input formats** in your Code nodes:

```javascript
// Handle both JSON string and object formats
let data;

if (typeof items[0].json.body === 'string') {
  data = JSON.parse(items[0].json.body);
} else if (typeof items[0].json === 'object' && items[0].json.start_date) {
  data = items[0].json;
} else if (typeof items[0].json.body === 'object') {
  data = items[0].json.body;
} else {
  data = items[0].json;
}

// Now use data.param_name safely
return [{
  json: {
    start_date: data.start_date,
    end_date: data.end_date
  }
}];
```

**Why this matters:**
- Different LLM providers (Ollama, Groq) format tool calls differently
- The same model may format arguments inconsistently between requests
- Some models wrap arguments in `body`, others don't
- Some stringify JSON, others pass objects directly

**Adapt the pattern** to your workflow's parameters - replace `start_date`/`end_date` with your actual field names.

## Voice Output Requirements

**CRITICAL:** All workflow responses are read aloud by a voice assistant.

- **Brief and conversational** - Target <30 seconds of speech
- **Plain text only** - No markdown, symbols, or JSON in responses
- **Natural language** - "Falcons 29, Bucs 28. Final." not `{"team": "ATL", "score": 29}`
- **Limit lists** - Top 3-5 items max, summarize the rest
- **Short names** - "Falcons" not "Atlanta Falcons", "1pm" not "1:00 PM EST"

**Good:** "Falcons 29, Bucs 28. Seahawks 16, Bears 7. Fifteen other games scheduled this weekend."

**Bad:** "Upcoming: Cleveland Browns at Chicago Bears, Sunday, December 14th at 1:00 PM EST..."

## Output Schema (REQUIRED)

**ALWAYS** return both a voice message AND structured data:

```javascript
return {
  message: "Brief voice response here",
  games: [...]  // or players, books, events, etc.
};
```

**Examples:**

```javascript
// Sports scores
return {
  message: "Bills 20, Browns 10. Seahawks beat Rams 38-37.",
  games: [
    { away: "BUF", awayScore: 20, home: "CLE", homeScore: 10, status: "live" },
    { away: "SEA", awayScore: 38, home: "LAR", homeScore: 37, status: "final" }
  ]
};

// Book search
return {
  message: "Found 8 Brandon Sanderson books including Mistborn and Stormlight.",
  books: [
    { title: "Mistborn", author: "Brandon Sanderson", format: "epub" },
    { title: "The Way of Kings", author: "Brandon Sanderson", format: "epub" }
  ]
};

// Calendar events
return {
  message: "You have 3 meetings today. First one at 10am with John.",
  events: [
    { title: "Meeting with John", time: "10:00 AM", duration: "1h" },
    { title: "Standup", time: "2:00 PM", duration: "15m" }
  ]
};
```

**Why this is required:**
- `message` - Read aloud by voice assistant
- Data array - Enables follow-up questions without re-calling the tool
  - "What about the Cowboys game?" → model filters from `games` array
  - "Tell me more about Mistborn" → model uses `books` array

**Never return just `{ message: "..." }` - always include the data array.**

## Common Patterns

**Pattern 0: Tool Suite (Multiple Actions)**
```
Webhook (POST) → Parse Parameters (Code) → Switch on Action
  ├─ action: "get"      → Get Logic → Format Response → Respond
  ├─ action: "add"      → Add Logic → Format Response ↗
  ├─ action: "complete" → Complete Logic → Format Response ↗
  └─ action: "delete"   → Delete Logic → Format Response ↗
```

**Tool Suite Structure:**
1. **Webhook** - Receives action + parameters
2. **Parse Parameters** - Extract action and params from body
3. **Switch Node** - Routes based on `action` parameter
4. **Action Branches** - Each action has its own logic
5. **Shared Response** - All branches converge to respond

**Switch Node Configuration:**
```json
{
  "parameters": {
    "rules": {
      "values": [
        {
          "conditions": {
            "conditions": [
              {
                "leftValue": "={{ $json.action }}",
                "rightValue": "get",
                "operator": { "type": "string", "operation": "equals" }
              }
            ]
          },
          "renameOutput": true,
          "outputKey": "get"
        },
        {
          "conditions": {
            "conditions": [
              {
                "leftValue": "={{ $json.action }}",
                "rightValue": "add",
                "operator": { "type": "string", "operation": "equals" }
              }
            ]
          },
          "renameOutput": true,
          "outputKey": "add"
        }
      ]
    }
  },
  "type": "n8n-nodes-base.switch",
  "typeVersion": 3,
  "name": "Switch Action"
}
```

**Webhook Notes for Suites:**
```
Task management suite - Google Tasks integration. Parameters: action (required) - 'get', 'add', 'complete', or 'delete'; title (required for add) - task name; task_id (required for complete/delete) - task ID; notes (optional for add); due (optional for add) - YYYY-MM-DD. Examples: 'what's on my task list', 'add task buy groceries', 'mark done the groceries task'.
```

Note: Single-line format, semicolons between parameters, clear action values, examples show natural voice queries.

**Pattern 1: Simple API Query**
```
Webhook (POST) → HTTP Request (external API) → Code (format) → Respond
```

**Pattern 2: Multi-Step**
```
Webhook (POST) → HTTP Request → Code (filter) → HTTP Request 2 → Code (format) → Respond
```

**Pattern 3: SSH Command**
```
Webhook (POST) → SSH (execute) → Code (parse) → Respond
```

**Pattern 4: Async/Long-Running (Delayed Response)**

For workflows that take too long for voice (>5 seconds), respond immediately then notify when done:

```
Webhook (POST) → Respond Immediately ("On it, I'll let you know when ready")
       ↓
  [Long-running work: API calls, SSH, etc.]
       ↓
  HTTP Request → CAAL Announce Webhook (speaks completion message)
```

**CAAL Announce Webhook:**
```json
{
  "parameters": {
    "method": "POST",
    "url": "http://192.168.86.47:8889/announce",
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={\"message\": \"Your task is complete.\"}"
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2
}
```

**Pattern 5: Gemini AI Analysis via SSH**

For complex analysis beyond simple formatting, use gemini-cli:

```
Webhook (POST) → [Gather data] → Build Context (Code) → SSH gemini-cli → Format → Respond/Email
```

**SSH Node for Gemini:**
```json
{
  "parameters": {
    "command": "=echo '{{ $json.context }}' | gemini -p 'Your analysis prompt here'"
  },
  "type": "n8n-nodes-base.ssh",
  "credentials": {
    "sshPassword": {
      "id": "cmac@caal",
      "name": "cmac@caal"
    }
  }
}
```

**Reference Implementation:** See `yahoo_fantasy_weekly_report.json` for a complete example combining:
- Immediate voice response + async completion announcement
- Multiple parallel API calls with Merge node
- Gemini CLI for AI analysis
- HTML email formatting and Gmail send

## Error Handling (REQUIRED)

**All CAAL workflows MUST have proper error handling.** Silent failures are unacceptable - CAAL needs to speak errors to the user.

### Pattern: Two-Branch Error Routing

Use `onError: "continueErrorOutput"` on API/service nodes to route errors to a second output branch:

```
API Node (output 0) → Format Success → Respond to Webhook
         (output 1) → Format Error   ↗
```

**HTTP Request Node with Error Output:**
```json
{
  "parameters": {
    "method": "GET",
    "url": "https://api.example.com/endpoint",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "httpHeaderAuth",
    "options": {}
  },
  "onError": "continueErrorOutput",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "name": "Get Data",
  "credentials": {
    "httpHeaderAuth": {
      "id": "my_credential",
      "name": "my_credential"
    }
  }
}
```

**Connections for Two-Branch Pattern:**
```json
"Get Data": {
  "main": [
    [{"node": "Format Success", "type": "main", "index": 0}],
    [{"node": "Format Error", "type": "main", "index": 0}]
  ]
}
```

**Format Error Node (voice-friendly errors):**
```javascript
// Format error for voice
const errorData = items[0].json;
let errorMsg = errorData.message || errorData.error || 'Unknown error';

if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
  errorMsg = 'Authentication failed. Check the API key in n8n.';
} else if (errorMsg.includes('ECONNREFUSED') || errorMsg.includes('ETIMEDOUT')) {
  errorMsg = 'Cannot connect to the service. Is it running?';
} else if (errorMsg.includes('Credential')) {
  errorMsg = 'Credentials not found in n8n.';
}

return { message: `Error: ${errorMsg}`, error: true };
```

### Why This Pattern?

1. **No silent failures** - User hears what went wrong
2. **Visible in n8n UI** - Can see which path (success/error) was taken
3. **Voice-friendly errors** - Technical messages translated to plain speech
4. **Consistent structure** - Both paths end at same Respond node

### Multi-API Workflows

For workflows with multiple API calls, each API node needs its own error branch:

```
Webhook → Get Users (output 0) → Extract ID → Get Items (output 0) → Format Success → Respond
                    (output 1) → Format Error 1 ────────────────────────────────────↗
                                               (output 1) → Format Error 2 ────────↗
```

### Code Node Error Handling

For code nodes processing data (not making API calls), use try/catch:

```javascript
try {
  const data = $input.item.json;
  // ... processing ...
  return { message: "Success response", data: [...] };
} catch (error) {
  return { message: "Sorry, I couldn't process that data.", error: true };
}
```

## Session Context

This is a **persistent session**. I will:
- Remember patterns from previous workflows
- Learn from fixes and improvements
- Build knowledge of CAAL's setup over time

---

**Ready to build.** Provide a description and I'll create the workflow.

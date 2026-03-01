# Huly MCP Server — Build Spec

## What
An MCP (Model Context Protocol) server that wraps Huly's official TypeScript API client (`@hcengineering/api-client`) to expose Huly project management operations as MCP tools.

## Why
Huly is a fast-growing open-source alternative to Linear/Jira/Slack/Notion. It has a solid typed API client but NO working MCP server exists. The one on npm (`@zubeidhendricks/huly-mcp-server`) is entirely mock data — never actually connects to Huly.

## Architecture
- **Transport:** MCP stdio (standard MCP server pattern)
- **SDK:** Use `@modelcontextprotocol/sdk` for MCP server implementation
- **Huly client:** Use `@hcengineering/api-client` for all Huly operations
- **Language:** TypeScript, compiled to JS
- **Package name:** `@bluesun-networks/huly-mcp` (npm)

## Configuration (env vars)
- `HULY_URL` — Huly instance URL (default: `http://localhost:8087`)
- `HULY_EMAIL` — User email for authentication
- `HULY_PASSWORD` — User password
- `HULY_WORKSPACE` — Workspace slug

## MCP Tools to Implement

### Issues (Tracker)
- `list_projects` — List all projects in the workspace
- `list_issues` — List issues in a project (with optional filters: status, priority, assignee)
- `get_issue` — Get a single issue by identifier (e.g., "PROJ-123")
- `create_issue` — Create an issue (project, title, description, priority, due date)
- `update_issue` — Update issue fields (title, description, status, priority, assignee, due date)

### Documents
- `list_teamspaces` — List document teamspaces
- `list_documents` — List documents in a teamspace
- `create_document` — Create a document (teamspace, title, markdown content)

### People / Contacts
- `list_people` — List people in the workspace
- `create_person` — Create a person with email

### Labels
- `list_labels` — List available labels/tags
- `add_label` — Add a label to an issue

## Reference Code
The `reference-examples/` directory contains official Huly API examples showing:
- How to connect and authenticate (`ConnectOptions`, `NodeWebSocketFactory`)
- How to query issues, projects, documents, people
- How to create and update entities
- How to work with markup/markdown content

**Study these carefully** — they show the exact API patterns to use.

## Key Patterns from Reference Examples

### Connection
```typescript
import { ConnectOptions, NodeWebSocketFactory, connect } from '@hcengineering/api-client'

const options: ConnectOptions = {
  email: process.env.HULY_EMAIL,
  password: process.env.HULY_PASSWORD,
  workspace: process.env.HULY_WORKSPACE,
  socketFactory: NodeWebSocketFactory,
  connectionTimeout: 30000
}
const client = await connect(url, options)
```

### Querying
```typescript
// Find one
const project = await client.findOne(tracker.class.Project, { identifier: 'HULY' })

// Find all with options
const issues = await client.findAll(tracker.class.Issue, { space: project._id }, { limit: 20, sort: { modifiedOn: SortingOrder.Descending } })
```

## Project Structure
```
huly-mcp/
├── src/
│   ├── index.ts          # Entry point, MCP server setup
│   ├── huly-client.ts    # Huly connection management
│   ├── tools/
│   │   ├── issues.ts     # Issue-related tools
│   │   ├── documents.ts  # Document-related tools
│   │   ├── people.ts     # People/contact tools
│   │   └── labels.ts     # Label tools
│   └── utils.ts          # Shared utilities
├── package.json
├── tsconfig.json
├── README.md             # Usage docs, config, examples
├── LICENSE               # MIT
└── reference-examples/   # Official Huly API examples (for reference only, not shipped)
```

## Build & Run
```bash
npm run build        # Compile TypeScript
node dist/index.js   # Run server (stdio transport)
```

## MCP Client Config Example (for README)
```json
{
  "mcpServers": {
    "huly": {
      "command": "npx",
      "args": ["@bluesun-networks/huly-mcp"],
      "env": {
        "HULY_URL": "https://huly.example.com",
        "HULY_EMAIL": "user@example.com",
        "HULY_PASSWORD": "password",
        "HULY_WORKSPACE": "my-workspace"
      }
    }
  }
}
```

## Quality
- Proper error handling (connection failures, auth errors, not-found)
- TypeScript strict mode
- Clean tool descriptions for LLM consumption
- README with badges, setup instructions, tool reference
- .gitignore (node_modules, dist, .env)

## Do NOT
- Include mock data
- Include tests (we'll add later)
- Over-engineer — keep it thin and direct
- Ship the reference-examples directory (add to .npmignore)

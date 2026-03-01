# @bluesun-networks/huly-mcp

MCP server for [Huly](https://huly.io) project management — issues, documents, people, and labels.

Wraps the official `@hcengineering/api-client` to expose Huly operations as [Model Context Protocol](https://modelcontextprotocol.io) tools.

## Setup

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `HULY_URL` | No | `http://localhost:8087` | Huly instance URL |
| `HULY_EMAIL` | Yes | | User email for authentication |
| `HULY_PASSWORD` | Yes | | User password |
| `HULY_WORKSPACE` | Yes | | Workspace slug |

### MCP Client Configuration

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

## Tools

### Issues (Tracker)

| Tool | Description |
|---|---|
| `list_projects` | List all projects in the workspace |
| `list_issues` | List issues in a project (filter by priority) |
| `get_issue` | Get a single issue by identifier (e.g. `HULY-123`) |
| `create_issue` | Create an issue with title, description, priority, due date |
| `update_issue` | Update issue fields |

### Documents

| Tool | Description |
|---|---|
| `list_teamspaces` | List document teamspaces |
| `list_documents` | List documents in a teamspace |
| `create_document` | Create a document with markdown content |

### People / Contacts

| Tool | Description |
|---|---|
| `list_people` | List people with email addresses |
| `create_person` | Create a person with email |

### Labels

| Tool | Description |
|---|---|
| `list_labels` | List available labels for issues |
| `add_label` | Add a label to an issue |

## Build

```bash
npm install
npm run build
node dist/index.js
```

## License

MIT

#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { closeClient } from './huly-client.js'
import { listProjects, listIssues, getIssue, createIssue, updateIssue } from './tools/issues.js'
import { listTeamspaces, listDocuments, createDocument } from './tools/documents.js'
import { listPeople, createPerson } from './tools/people.js'
import { listLabels, addLabel } from './tools/labels.js'

const server = new McpServer({
  name: 'huly-mcp',
  version: '0.1.0'
})

// --- Issues / Tracker ---

server.tool(
  'list_projects',
  'List all projects in the Huly workspace',
  {},
  async () => {
    try {
      const result = await listProjects()
      return { content: [{ type: 'text', text: result }] }
    } catch (e: any) {
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true }
    }
  }
)

server.tool(
  'list_issues',
  'List issues in a project, with optional filters for priority',
  {
    project: z.string().describe('Project identifier (e.g. "HULY")'),
    priority: z.string().optional().describe('Filter by priority: urgent, high, medium, low, no_priority')
  },
  async (args) => {
    try {
      const result = await listIssues(args)
      return { content: [{ type: 'text', text: result }] }
    } catch (e: any) {
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true }
    }
  }
)

server.tool(
  'get_issue',
  'Get a single issue by its identifier (e.g. "HULY-123")',
  {
    identifier: z.string().describe('Issue identifier (e.g. "HULY-123")')
  },
  async (args) => {
    try {
      const result = await getIssue(args)
      return { content: [{ type: 'text', text: result }] }
    } catch (e: any) {
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true }
    }
  }
)

server.tool(
  'create_issue',
  'Create a new issue in a project',
  {
    project: z.string().describe('Project identifier (e.g. "HULY")'),
    title: z.string().describe('Issue title'),
    description: z.string().optional().describe('Issue description in markdown'),
    priority: z.string().optional().describe('Priority: urgent, high, medium, low, no_priority'),
    dueDate: z.string().optional().describe('Due date in ISO format (e.g. "2025-12-31")')
  },
  async (args) => {
    try {
      const result = await createIssue(args)
      return { content: [{ type: 'text', text: result }] }
    } catch (e: any) {
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true }
    }
  }
)

server.tool(
  'update_issue',
  'Update fields on an existing issue',
  {
    identifier: z.string().describe('Issue identifier (e.g. "HULY-123")'),
    title: z.string().optional().describe('New title'),
    description: z.string().optional().describe('New description in markdown'),
    priority: z.string().optional().describe('New priority: urgent, high, medium, low, no_priority'),
    dueDate: z.string().optional().describe('New due date in ISO format (e.g. "2025-12-31")')
  },
  async (args) => {
    try {
      const result = await updateIssue(args)
      return { content: [{ type: 'text', text: result }] }
    } catch (e: any) {
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true }
    }
  }
)

// --- Documents ---

server.tool(
  'list_teamspaces',
  'List all document teamspaces in the workspace',
  {},
  async () => {
    try {
      const result = await listTeamspaces()
      return { content: [{ type: 'text', text: result }] }
    } catch (e: any) {
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true }
    }
  }
)

server.tool(
  'list_documents',
  'List documents in a teamspace',
  {
    teamspace: z.string().describe('Teamspace name (e.g. "My Documents")')
  },
  async (args) => {
    try {
      const result = await listDocuments(args)
      return { content: [{ type: 'text', text: result }] }
    } catch (e: any) {
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true }
    }
  }
)

server.tool(
  'create_document',
  'Create a new document in a teamspace',
  {
    teamspace: z.string().describe('Teamspace name (e.g. "My Documents")'),
    title: z.string().describe('Document title'),
    content: z.string().describe('Document content in markdown')
  },
  async (args) => {
    try {
      const result = await createDocument(args)
      return { content: [{ type: 'text', text: result }] }
    } catch (e: any) {
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true }
    }
  }
)

// --- People / Contacts ---

server.tool(
  'list_people',
  'List all people in the workspace with their email addresses',
  {},
  async () => {
    try {
      const result = await listPeople()
      return { content: [{ type: 'text', text: result }] }
    } catch (e: any) {
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true }
    }
  }
)

server.tool(
  'create_person',
  'Create a new person with an email address',
  {
    firstName: z.string().describe('First name'),
    lastName: z.string().describe('Last name'),
    email: z.string().describe('Email address'),
    city: z.string().optional().describe('City')
  },
  async (args) => {
    try {
      const result = await createPerson(args)
      return { content: [{ type: 'text', text: result }] }
    } catch (e: any) {
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true }
    }
  }
)

// --- Labels ---

server.tool(
  'list_labels',
  'List all available labels/tags for issues',
  {},
  async () => {
    try {
      const result = await listLabels()
      return { content: [{ type: 'text', text: result }] }
    } catch (e: any) {
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true }
    }
  }
)

server.tool(
  'add_label',
  'Add a label to an issue (creates the label if it does not exist)',
  {
    issue: z.string().describe('Issue identifier (e.g. "HULY-123")'),
    label: z.string().describe('Label name')
  },
  async (args) => {
    try {
      const result = await addLabel(args)
      return { content: [{ type: 'text', text: result }] }
    } catch (e: any) {
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true }
    }
  }
)

// --- Start ---

async function main (): Promise<void> {
  const transport = new StdioServerTransport()
  await server.connect(transport)

  process.on('SIGINT', async () => {
    await closeClient()
    process.exit(0)
  })
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})

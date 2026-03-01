/**
 * Integration tests for the Huly MCP server — all 12 tools.
 *
 * Requirements:
 *   HULY_URL       — Huly instance URL (e.g. https://huly.app)
 *   HULY_EMAIL     — Login email
 *   HULY_PASSWORD  — Login password
 *   HULY_WORKSPACE — Workspace slug
 *
 * These tests hit a REAL Huly instance.  They create data tagged with a
 * unique prefix so it can be identified and cleaned up later.
 *
 * CLEANUP NOTE: The Huly API does not expose a delete operation for most
 * objects.  Test data (issues, documents, people, labels) created by this
 * suite must be removed manually from the Huly UI.  All test data is
 * prefixed with the TEST_PREFIX below so it is easy to find.
 */

// Browser polyfills — MUST be imported before any @hcengineering code
import '../src/node-polyfills.js'

import { describe, it, expect, afterAll } from 'vitest'
import { closeClient } from '../src/huly-client.js'
import { listProjects, listIssues, getIssue, createIssue, updateIssue } from '../src/tools/issues.js'
import { listTeamspaces, listDocuments, createDocument } from '../src/tools/documents.js'
import { listPeople, createPerson } from '../src/tools/people.js'
import { listLabels, addLabel } from '../src/tools/labels.js'

// Unique prefix so test data is identifiable
const TEST_PREFIX = `MCP-TEST-${Date.now()}`

// Shared state across ordered tests
let projectIdentifier: string
let teamspaceName: string
let createdIssueIdentifier: string

// Skip the entire suite when env vars are missing
const REQUIRED_ENV = ['HULY_URL', 'HULY_EMAIL', 'HULY_PASSWORD', 'HULY_WORKSPACE']
const missingEnv = REQUIRED_ENV.filter(k => !process.env[k])

// ---------------------------------------------------------------------------
// Suite — skipped automatically when credentials are not configured
// ---------------------------------------------------------------------------
describe.skipIf(missingEnv.length > 0)('Huly MCP integration tests', () => {

  afterAll(async () => {
    await closeClient()
  })

  // -----------------------------------------------------------------------
  // 1. list_projects — fetch projects and remember the first one
  // -----------------------------------------------------------------------
  it('list_projects: returns at least one project', async () => {
    const result = await listProjects()
    expect(result).not.toBe('No projects found.')
    expect(result).toContain('- ')

    // Parse the first project identifier for later tests
    const match = result.match(/^- (\S+):/)
    expect(match).not.toBeNull()
    projectIdentifier = match![1]
  }, 30_000)

  // -----------------------------------------------------------------------
  // 2. create_issue — create a test issue in the first project
  // -----------------------------------------------------------------------
  it('create_issue: creates an issue with all optional fields', async () => {
    const title = `${TEST_PREFIX} test issue`
    const result = await createIssue({
      project: projectIdentifier,
      title,
      description: `Integration test issue created by ${TEST_PREFIX}`,
      priority: 'high',
      dueDate: '2099-12-31'
    })

    expect(result).toContain('Created issue')
    expect(result).toContain(title)

    // Extract the identifier (e.g. "HULY-42")
    const match = result.match(/Created issue (\S+):/)
    expect(match).not.toBeNull()
    createdIssueIdentifier = match![1]
  }, 30_000)

  // -----------------------------------------------------------------------
  // 3. get_issue — retrieve the issue we just created
  // -----------------------------------------------------------------------
  it('get_issue: retrieves the created issue with correct fields', async () => {
    const result = await getIssue({ identifier: createdIssueIdentifier })

    expect(result).toContain(`Identifier: ${createdIssueIdentifier}`)
    expect(result).toContain(`${TEST_PREFIX} test issue`)
    expect(result).toContain('Priority: High')
    expect(result).toContain('Due date: 2099-12-31')
    expect(result).toContain('Description:')
  }, 30_000)

  // -----------------------------------------------------------------------
  // 4. update_issue — change the title and priority
  // -----------------------------------------------------------------------
  it('update_issue: updates title and priority', async () => {
    const newTitle = `${TEST_PREFIX} updated issue`
    const result = await updateIssue({
      identifier: createdIssueIdentifier,
      title: newTitle,
      priority: 'urgent'
    })

    expect(result).toBe(`Updated issue ${createdIssueIdentifier}`)

    // Verify via get_issue
    const detail = await getIssue({ identifier: createdIssueIdentifier })
    expect(detail).toContain(newTitle)
    expect(detail).toContain('Priority: Urgent')
  }, 30_000)

  // -----------------------------------------------------------------------
  // 5. list_issues — ensure our issue appears in the list
  // -----------------------------------------------------------------------
  it('list_issues: lists issues for the project', async () => {
    const result = await listIssues({ project: projectIdentifier })
    expect(result).toContain(createdIssueIdentifier)
  }, 30_000)

  // -----------------------------------------------------------------------
  // 6. list_teamspaces — find a teamspace for document tests
  // -----------------------------------------------------------------------
  it('list_teamspaces: returns at least one teamspace', async () => {
    const result = await listTeamspaces()
    expect(result).not.toBe('No teamspaces found.')
    expect(result).toContain('- ')

    // Parse the first teamspace name
    const match = result.match(/^- ([^:\n]+)/)
    expect(match).not.toBeNull()
    teamspaceName = match![1].trim()
  }, 30_000)

  // -----------------------------------------------------------------------
  // 7. create_document — create a test document
  // -----------------------------------------------------------------------
  it('create_document: creates a document in the teamspace', async () => {
    const title = `${TEST_PREFIX} test doc`
    const result = await createDocument({
      teamspace: teamspaceName,
      title,
      content: `# Test Document\n\nCreated by integration tests (${TEST_PREFIX}).`
    })

    expect(result).toContain('Created document')
    expect(result).toContain(title)
    expect(result).toContain(teamspaceName)
  }, 30_000)

  // -----------------------------------------------------------------------
  // 8. list_documents — verify the document appears
  // -----------------------------------------------------------------------
  it('list_documents: lists documents including the one we created', async () => {
    const result = await listDocuments({ teamspace: teamspaceName })
    expect(result).toContain(`${TEST_PREFIX} test doc`)
  }, 30_000)

  // -----------------------------------------------------------------------
  // 9. list_people — fetch contacts
  // -----------------------------------------------------------------------
  it('list_people: returns a list of people', async () => {
    const result = await listPeople()
    // There should be at least the workspace owner
    expect(result).toContain('- ')
  }, 30_000)

  // -----------------------------------------------------------------------
  // 10. create_person — create a test contact
  // -----------------------------------------------------------------------
  it('create_person: creates a person with email and city', async () => {
    const firstName = 'Test'
    const lastName = TEST_PREFIX
    const email = `${TEST_PREFIX.toLowerCase()}@example.com`

    const result = await createPerson({
      firstName,
      lastName,
      email,
      city: 'Testville'
    })

    expect(result).toContain('Created person')
    expect(result).toContain(firstName)
    expect(result).toContain(lastName)
    expect(result).toContain(email)
  }, 30_000)

  // -----------------------------------------------------------------------
  // 11. list_labels — fetch existing labels
  // -----------------------------------------------------------------------
  it('list_labels: returns labels (or empty message)', async () => {
    const result = await listLabels()
    // Either "No labels found." or a list of labels — both are valid
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  }, 30_000)

  // -----------------------------------------------------------------------
  // 12. add_label — add a label to the test issue
  // -----------------------------------------------------------------------
  it('add_label: adds a label to the created issue', async () => {
    const labelName = `${TEST_PREFIX}-label`
    const result = await addLabel({
      issue: createdIssueIdentifier,
      label: labelName
    })

    expect(result).toContain(`Added label "${labelName}"`)
    expect(result).toContain(createdIssueIdentifier)

    // Verify the label now exists in the list
    const labels = await listLabels()
    expect(labels).toContain(labelName)
  }, 30_000)
})

import core, { type MarkupBlobRef, type Ref, SortingOrder, generateId } from '@hcengineering/core'
import { makeRank } from '@hcengineering/rank'
import tracker, { type Issue, IssuePriority } from '@hcengineering/tracker'
import { getClient } from '../huly-client.js'
import { parsePriority, priorityToString } from '../utils.js'

export async function listProjects (): Promise<string> {
  const client = await getClient()
  const projects = await client.findAll(tracker.class.Project, {})

  if (projects.length === 0) {
    return 'No projects found.'
  }

  const lines = projects.map(p =>
    `- ${p.identifier}: ${p.name ?? p.identifier}${p.description ? ' — ' + p.description : ''}`
  )
  return lines.join('\n')
}

export async function listIssues (args: {
  project: string
  status?: string
  priority?: string
  assignee?: string
}): Promise<string> {
  const client = await getClient()

  const project = await client.findOne(tracker.class.Project, { identifier: args.project })
  if (project === undefined) {
    throw new Error(`Project "${args.project}" not found`)
  }

  const query: Record<string, any> = { space: project._id }

  if (args.priority !== undefined) {
    const p = parsePriority(args.priority)
    if (p !== undefined) {
      query.priority = p
    }
  }

  const issues = await client.findAll(
    tracker.class.Issue,
    query,
    {
      limit: 50,
      sort: { modifiedOn: SortingOrder.Descending }
    }
  )

  if (issues.length === 0) {
    return `No issues found in project ${args.project}.`
  }

  const lines: string[] = []
  for (const issue of issues) {
    lines.push(`- ${issue.identifier}: ${issue.title} [${priorityToString(issue.priority)}]`)
  }
  return lines.join('\n')
}

export async function getIssue (args: { identifier: string }): Promise<string> {
  const client = await getClient()

  const issue = await client.findOne(tracker.class.Issue, { identifier: args.identifier })
  if (issue === undefined) {
    throw new Error(`Issue "${args.identifier}" not found`)
  }

  let description = ''
  if (issue.description) {
    description = await client.fetchMarkup(issue._class, issue._id, 'description', issue.description, 'markdown')
  }

  return [
    `Identifier: ${issue.identifier}`,
    `Title: ${issue.title}`,
    `Priority: ${priorityToString(issue.priority)}`,
    `Due date: ${issue.dueDate ? new Date(issue.dueDate).toISOString().slice(0, 10) : 'None'}`,
    `Description:\n${description || '(empty)'}`
  ].join('\n')
}

export async function createIssue (args: {
  project: string
  title: string
  description?: string
  priority?: string
  dueDate?: string
}): Promise<string> {
  const client = await getClient()

  const project = await client.findOne(tracker.class.Project, { identifier: args.project })
  if (project === undefined) {
    throw new Error(`Project "${args.project}" not found`)
  }

  const issueId: Ref<Issue> = generateId()

  const incResult = await client.updateDoc(
    tracker.class.Project,
    core.space.Space,
    project._id,
    { $inc: { sequence: 1 } },
    true
  )
  const sequence = (incResult as any).object.sequence

  const lastOne = await client.findOne<Issue>(
    tracker.class.Issue,
    { space: project._id },
    { sort: { rank: SortingOrder.Descending } }
  )

  let description: MarkupBlobRef = '' as MarkupBlobRef
  if (args.description) {
    description = await client.uploadMarkup(
      tracker.class.Issue, issueId, 'description', args.description, 'markdown'
    ) as MarkupBlobRef
  }

  const priority = parsePriority(args.priority) ?? IssuePriority.NoPriority
  const dueDate = args.dueDate ? new Date(args.dueDate).getTime() : null

  await client.addCollection(
    tracker.class.Issue,
    project._id,
    project._id,
    project._class,
    'issues',
    {
      title: args.title,
      description,
      status: project.defaultIssueStatus,
      number: sequence,
      kind: tracker.taskTypes.Issue,
      identifier: `${project.identifier}-${sequence}`,
      priority,
      assignee: null,
      component: null,
      estimation: 0,
      remainingTime: 0,
      reportedTime: 0,
      reports: 0,
      subIssues: 0,
      parents: [],
      childInfo: [],
      dueDate,
      rank: makeRank(lastOne?.rank, undefined)
    },
    issueId
  )

  return `Created issue ${project.identifier}-${sequence}: ${args.title}`
}

export async function updateIssue (args: {
  identifier: string
  title?: string
  description?: string
  priority?: string
  dueDate?: string
}): Promise<string> {
  const client = await getClient()

  const issue = await client.findOne(tracker.class.Issue, { identifier: args.identifier })
  if (issue === undefined) {
    throw new Error(`Issue "${args.identifier}" not found`)
  }

  const update: Record<string, any> = {}

  if (args.title !== undefined) {
    update.title = args.title
  }

  if (args.description !== undefined) {
    update.description = await client.uploadMarkup(
      tracker.class.Issue, issue._id, 'description', args.description, 'markdown'
    )
  }

  if (args.priority !== undefined) {
    const p = parsePriority(args.priority)
    if (p !== undefined) {
      update.priority = p
    }
  }

  if (args.dueDate !== undefined) {
    update.dueDate = new Date(args.dueDate).getTime()
  }

  if (Object.keys(update).length === 0) {
    return 'No fields to update.'
  }

  await client.updateDoc(tracker.class.Issue, issue.space, issue._id, update)

  return `Updated issue ${args.identifier}`
}

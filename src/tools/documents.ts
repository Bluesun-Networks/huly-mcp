import { type Ref, SortingOrder, generateId } from '@hcengineering/core'
import document, { type Document } from '@hcengineering/document'
import { makeRank } from '@hcengineering/rank'
import { getClient } from '../huly-client.js'

export async function listTeamspaces (): Promise<string> {
  const client = await getClient()
  const teamspaces = await client.findAll(document.class.Teamspace, { archived: false })

  if (teamspaces.length === 0) {
    return 'No teamspaces found.'
  }

  const lines = teamspaces.map(ts =>
    `- ${ts.name}${ts.description ? ': ' + ts.description : ''}`
  )
  return lines.join('\n')
}

export async function listDocuments (args: { teamspace: string }): Promise<string> {
  const client = await getClient()

  const teamspace = await client.findOne(document.class.Teamspace, {
    name: args.teamspace,
    archived: false
  })
  if (teamspace === undefined) {
    throw new Error(`Teamspace "${args.teamspace}" not found`)
  }

  const docs = await client.findAll(
    document.class.Document,
    { space: teamspace._id },
    {
      limit: 50,
      sort: { name: SortingOrder.Ascending }
    }
  )

  if (docs.length === 0) {
    return `No documents found in teamspace "${args.teamspace}".`
  }

  const lines: string[] = []
  for (const doc of docs) {
    lines.push(`- ${doc.title}`)
  }
  return lines.join('\n')
}

export async function createDocument (args: {
  teamspace: string
  title: string
  content: string
}): Promise<string> {
  const client = await getClient()

  const teamspace = await client.findOne(document.class.Teamspace, {
    name: args.teamspace,
    archived: false
  })
  if (teamspace === undefined) {
    throw new Error(`Teamspace "${args.teamspace}" not found`)
  }

  const lastOne = await client.findOne<Document>(
    document.class.Document,
    { space: teamspace._id },
    { sort: { rank: SortingOrder.Descending } }
  )

  const documentId: Ref<Document> = generateId()
  const content = await client.uploadMarkup(
    document.class.Document, documentId, 'content', args.content, 'markdown'
  )

  await client.createDoc(
    document.class.Document,
    teamspace._id,
    {
      title: args.title,
      content,
      parent: document.ids.NoParent,
      rank: makeRank(lastOne?.rank, undefined)
    },
    documentId
  )

  return `Created document "${args.title}" in teamspace "${args.teamspace}"`
}

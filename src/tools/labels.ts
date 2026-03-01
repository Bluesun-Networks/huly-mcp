import core, { type Ref, generateId } from '@hcengineering/core'
import tags, { type TagElement } from '@hcengineering/tags'
import tracker from '@hcengineering/tracker'
import { getClient } from '../huly-client.js'

export async function listLabels (): Promise<string> {
  const client = await getClient()
  const labels = await client.findAll(tags.class.TagElement, {
    targetClass: tracker.class.Issue
  })

  if (labels.length === 0) {
    return 'No labels found.'
  }

  const lines = labels.map(l => `- ${l.title}${l.description ? ': ' + l.description : ''}`)
  return lines.join('\n')
}

export async function addLabel (args: {
  issue: string
  label: string
}): Promise<string> {
  const client = await getClient()

  const issue = await client.findOne(tracker.class.Issue, { identifier: args.issue })
  if (issue === undefined) {
    throw new Error(`Issue "${args.issue}" not found`)
  }

  // Find existing label or create one
  let labelDoc = await client.findOne(tags.class.TagElement, {
    title: args.label,
    targetClass: tracker.class.Issue
  })

  if (labelDoc === undefined) {
    const labelId: Ref<TagElement> = generateId()
    await client.createDoc(
      tags.class.TagElement,
      core.space.Workspace,
      {
        title: args.label,
        description: '',
        targetClass: tracker.class.Issue,
        color: 0,
        category: tracker.category.Other
      },
      labelId
    )
    labelDoc = await client.findOne(tags.class.TagElement, { _id: labelId })
    if (labelDoc === undefined) {
      throw new Error('Failed to create label')
    }
  }

  await client.addCollection(
    tags.class.TagReference,
    issue.space,
    issue._id,
    tracker.class.Issue,
    'labels',
    {
      title: labelDoc.title,
      color: labelDoc.color,
      tag: labelDoc._id
    }
  )

  return `Added label "${args.label}" to issue ${args.issue}`
}

import contact, { AvatarType, type Person } from '@hcengineering/contact'
import { generateId } from '@hcengineering/core'
import { getClient } from '../huly-client.js'

export async function listPeople (): Promise<string> {
  const client = await getClient()
  const persons = await client.findAll(contact.class.Person, {}, { limit: 100 })

  if (persons.length === 0) {
    return 'No people found.'
  }

  const lines: string[] = []
  for (const person of persons) {
    const channels = await client.findAll(contact.class.Channel, {
      attachedTo: person._id,
      attachedToClass: person._class
    }, { limit: 50 })
    const emails = channels
      .filter(ch => ch.provider === contact.channelProvider.Email)
      .map(ch => ch.value)
    const emailStr = emails.length > 0 ? ` (${emails.join(', ')})` : ''
    lines.push(`- ${person.name}${person.city ? ', ' + person.city : ''}${emailStr}`)
  }
  return lines.join('\n')
}

export async function createPerson (args: {
  firstName: string
  lastName: string
  email: string
  city?: string
}): Promise<string> {
  const client = await getClient()

  const personId = generateId<Person>()

  await client.createDoc(
    contact.class.Person,
    contact.space.Contacts,
    {
      name: `${args.lastName},${args.firstName}`,
      city: args.city ?? '',
      avatarType: AvatarType.COLOR
    },
    personId
  )

  await client.addCollection(
    contact.class.Channel,
    contact.space.Contacts,
    personId,
    contact.class.Person,
    'channels',
    {
      provider: contact.channelProvider.Email,
      value: args.email
    }
  )

  return `Created person ${args.firstName} ${args.lastName} (${args.email})`
}

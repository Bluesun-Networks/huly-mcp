import { ConnectOptions, NodeWebSocketFactory, connect, type PlatformClient } from '@hcengineering/api-client'

let client: PlatformClient | undefined

export async function getClient (): Promise<PlatformClient> {
  if (client !== undefined) {
    return client
  }

  const url = process.env.HULY_URL ?? 'http://localhost:8087'
  const email = process.env.HULY_EMAIL
  const password = process.env.HULY_PASSWORD
  const workspace = process.env.HULY_WORKSPACE

  if (email === undefined || password === undefined || workspace === undefined) {
    throw new Error('Missing required environment variables: HULY_EMAIL, HULY_PASSWORD, HULY_WORKSPACE')
  }

  const options: ConnectOptions = {
    email,
    password,
    workspace,
    socketFactory: NodeWebSocketFactory,
    connectionTimeout: 30000
  }

  client = await connect(url, options)
  return client
}

export async function closeClient (): Promise<void> {
  if (client !== undefined) {
    await client.close()
    client = undefined
  }
}

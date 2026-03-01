import { ConnectOptions, connect, type PlatformClient } from '@hcengineering/api-client'
import client from '@hcengineering/client'
import { setMetadata } from '@hcengineering/platform'
import { PatchedNodeWebSocketFactory } from './socket-factory.js'

let hcClient: PlatformClient | undefined

// No-op persistence store for Node.js (IndexedDB doesn't exist)
const nullPersistence = {
  load: async () => ({ full: true, transactions: [], hash: '' }),
  store: async () => {}
}

export async function getClient (): Promise<PlatformClient> {
  if (hcClient !== undefined) {
    return hcClient
  }

  const url = process.env.HULY_URL ?? 'http://localhost:8087'
  const email = process.env.HULY_EMAIL
  const password = process.env.HULY_PASSWORD
  const workspace = process.env.HULY_WORKSPACE

  if (email === undefined || password === undefined || workspace === undefined) {
    throw new Error('Missing required environment variables: HULY_EMAIL, HULY_PASSWORD, HULY_WORKSPACE')
  }

  setMetadata(client.metadata.UseBinaryProtocol, false)
  setMetadata(client.metadata.UseProtocolCompression, false)
  setMetadata(client.metadata.OverridePersistenceStore, nullPersistence as any)

  const options: ConnectOptions = {
    email,
    password,
    workspace,
    socketFactory: PatchedNodeWebSocketFactory,
    connectionTimeout: 30000
  }

  hcClient = await connect(url, options)
  return hcClient
}

export async function closeClient (): Promise<void> {
  if (hcClient !== undefined) {
    await hcClient.close()
    hcClient = undefined
  }
}

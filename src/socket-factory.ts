import type { ClientSocket } from '@hcengineering/client'

export const PatchedNodeWebSocketFactory = (url: string): ClientSocket => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const WebSocket = require('ws')
  const ws = new WebSocket(url)

  const client: ClientSocket = {
    get readyState () { return ws.readyState },
    send: (data: any) => {
      if (data instanceof Blob) {
        void data.arrayBuffer().then((buffer: ArrayBuffer) => { ws.send(buffer) })
      } else {
        ws.send(data)
      }
    },
    close: (code?: number) => { ws.close(code) },
    onmessage: null,
    onclose: null,
    onopen: null,
    onerror: null
  } as any

  ws.on('message', (data: any, isBinary: boolean) => {
    if ((client as any).onmessage != null) {
      let eventData = data
      // For text frames, convert Buffer to string so ping/pong string comparisons work
      // For binary frames, convert to ArrayBuffer which the SDK expects
      if (!isBinary && Buffer.isBuffer(data)) {
        eventData = data.toString()
      } else if (isBinary && Buffer.isBuffer(data)) {
        // Convert Node Buffer to ArrayBuffer for the SDK's Blob/ArrayBuffer handling
        eventData = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
      }
      const event = { data: eventData, type: 'message', target: undefined }
      ;(client as any).onmessage(event)
    }
  })

  ws.on('close', (code: number, reason: any) => {
    if ((client as any).onclose != null) {
      ;(client as any).onclose({ code, reason, wasClean: code === 1000, type: 'close', target: undefined })
    }
  })

  ws.on('open', () => {
    if ((client as any).onopen != null) {
      ;(client as any).onopen({ type: 'open', target: undefined })
    }
  })

  ws.on('error', (error: Error) => {
    if ((client as any).onerror != null) {
      ;(client as any).onerror({ type: 'error', target: undefined, error })
    }
  })

  return client as ClientSocket
}

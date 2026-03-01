// Polyfill browser globals needed by Huly's client-resources module
// Must be imported BEFORE any @hcengineering imports

import { EventEmitter } from 'events'

if (typeof globalThis.window === 'undefined') {
  const emitter = new EventEmitter()
  const win: any = globalThis
  win.window = win
  win.addEventListener = (event: string, handler: any) => emitter.on(event, handler)
  win.removeEventListener = (event: string, handler: any) => emitter.off(event, handler)
  win.dispatchEvent = (event: any) => emitter.emit(event?.type ?? event, event)
  if (!win.navigator) win.navigator = { userAgent: 'node', onLine: true, language: 'en' }
  win.location = win.location ?? { href: 'http://localhost', origin: 'http://localhost', protocol: 'http:', host: 'localhost', hostname: 'localhost', pathname: '/' }
  win.document = win.document ?? {
    createElement: (tag: string) => ({ style: {}, tagName: tag, setAttribute: () => {}, getAttribute: () => null, documentElement: { style: {} },
    addEventListener: () => {}, removeEventListener: () => {}, appendChild: () => {}, removeChild: () => {}, childNodes: [], parentNode: null, ownerDocument: null }),
    createTextNode: () => ({}),
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    body: { appendChild: () => {}, removeChild: () => {} },
    head: { appendChild: () => {}, removeChild: () => {} },
    documentElement: { style: {} },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {}
  }
}

if (typeof globalThis.indexedDB === 'undefined') {
  ;(globalThis as any).indexedDB = {
    open: (name: string, version?: number) => {
      const request: any = {
        result: {
          objectStoreNames: { contains: () => false },
          createObjectStore: () => ({
            createIndex: () => {},
            put: () => ({ onsuccess: null, onerror: null }),
            get: () => ({ onsuccess: null, onerror: null }),
            delete: () => ({ onsuccess: null, onerror: null })
          }),
          transaction: () => ({
            objectStore: () => ({
              put: () => ({ onsuccess: null, onerror: null }),
              get: () => ({ onsuccess: null, onerror: null }),
              getAll: () => ({ onsuccess: null, onerror: null }),
              delete: () => ({ onsuccess: null, onerror: null }),
              openCursor: () => ({ onsuccess: null, onerror: null })
            }),
            oncomplete: null,
            onerror: null
          }),
          close: () => {},
          onclose: null,
          onversionchange: null
        },
        error: null,
        onsuccess: null as any,
        onerror: null as any,
        onupgradeneeded: null as any
      }
      setTimeout(() => {
        if (request.onupgradeneeded) {
          request.onupgradeneeded({ target: { result: request.result } })
        }
        if (request.onsuccess) {
          request.onsuccess({ target: { result: request.result } })
        }
      }, 0)
      return request
    },
    deleteDatabase: () => {
      const req: any = { onsuccess: null, onerror: null }
      setTimeout(() => { if (req.onsuccess) req.onsuccess({}) }, 0)
      return req
    }
  }
}

if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>()
  ;(globalThis as any).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
    clear: () => store.clear(),
    get length () { return store.size },
    key: (i: number) => [...store.keys()][i] ?? null
  }
}

if (typeof globalThis.BroadcastChannel === 'undefined') {
  ;(globalThis as any).BroadcastChannel = class BroadcastChannel {
    name: string
    onmessage: any = null
    constructor (name: string) { this.name = name }
    postMessage () {}
    close () {}
  }
}

if (typeof globalThis.fetch === 'undefined') {
  ;(globalThis as any).fetch = async () => ({ ok: true, json: async () => ({}), text: async () => '' })
}

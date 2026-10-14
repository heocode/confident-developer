import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'

import { ApiError } from '../../src/api/api-error.ts'
import { sendApiData } from '../../src/api/http-client.ts'

const originalFetch = globalThis.fetch

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('HTTP client mutations', () => {
  it('sends JSON through a relative API path with same-origin credentials', async () => {
    const controller = new AbortController()
    let requestedInput: RequestInfo | URL | undefined
    let requestedInit: RequestInit | undefined

    globalThis.fetch = async (input, init) => {
      requestedInput = input
      requestedInit = init
      return jsonResponse({ success: true, message: 'Updated.', data: { updated: true } })
    }

    const result = await sendApiData<{ updated: boolean }, { revision: number }>('/api/v1/example', {
      method: 'PUT',
      body: { revision: 3 },
      signal: controller.signal,
    })

    assert.equal(requestedInput, '/api/v1/example')
    assert.equal(requestedInit?.method, 'PUT')
    assert.equal(requestedInit?.credentials, 'same-origin')
    assert.equal(requestedInit?.body, JSON.stringify({ revision: 3 }))
    assert.equal(requestedInit?.signal, controller.signal)
    assert.deepEqual(requestedInit?.headers, {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    })
    assert.deepEqual(result, { updated: true })
  })

  it('rejects non-relative API paths before sending a request', async () => {
    let requested = false
    globalThis.fetch = async () => {
      requested = true
      return jsonResponse({ success: true, message: 'Unexpected.', data: null })
    }

    await assert.rejects(
      sendApiData('https://example.test/api/v1/example', { method: 'POST', body: {} }),
      /relative \/api/,
    )
    assert.equal(requested, false)
  })

  it('normalizes HTTP and network errors without swallowing aborts', async () => {
    globalThis.fetch = async () =>
      jsonResponse({ success: false, message: 'Revision is stale.' }, { status: 409 })

    await assert.rejects(
      sendApiData('/api/v1/example', { method: 'DELETE', body: { revision: 1 } }),
      (error: unknown) => {
        assert.ok(error instanceof ApiError)
        assert.equal(error.kind, 'http')
        assert.equal(error.status, 409)
        assert.equal(error.message, 'Revision is stale.')
        return true
      },
    )

    const abortError = new DOMException('The operation was aborted.', 'AbortError')
    globalThis.fetch = async () => {
      throw abortError
    }

    await assert.rejects(
      sendApiData('/api/v1/example', { method: 'POST', body: {} }),
      (error: unknown) => error === abortError,
    )
  })
})

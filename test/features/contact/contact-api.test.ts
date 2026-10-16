import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'

import { ApiError } from '../../../src/api/api-error.ts'
import { submitContact } from '../../../src/features/contact/api/contact-api.ts'
import type { SubmitContactInput } from '../../../src/features/contact/model/contact.types.ts'

const originalFetch = globalThis.fetch

const submission: SubmitContactInput = {
  name: 'Jordan Smith',
  email: 'jordan@example.com',
  message: 'I would like to discuss a portfolio application.',
  scopes: ['website-web-app', 'backend-api'],
  budget: '2500-5000',
  turnstileToken: 'verified-contact-token',
  website: '',
}

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('Contact API', () => {
  it('submits the exact public payload to the relative Contact endpoint', async () => {
    const controller = new AbortController()
    let requestedInput: RequestInfo | URL | undefined
    let requestedInit: RequestInit | undefined

    globalThis.fetch = async (input, init) => {
      requestedInput = input
      requestedInit = init
      return jsonResponse(
        { success: true, message: 'Your inquiry was sent successfully.' },
        { status: 201 },
      )
    }

    const result = await submitContact(submission, { signal: controller.signal })

    assert.equal(result, undefined)
    assert.equal(requestedInput, '/api/v1/contact')
    assert.equal(requestedInit?.method, 'POST')
    assert.equal(requestedInit?.credentials, 'same-origin')
    assert.equal(requestedInit?.body, JSON.stringify(submission))
    assert.equal(requestedInit?.signal, controller.signal)
    assert.deepEqual(requestedInit?.headers, {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    })
  })

  it('preserves safe HTTP errors from the Contact API', async () => {
    for (const [status, message] of [
      [400, 'Submission verification failed'],
      [409, 'This inquiry was already submitted recently'],
      [429, 'Too many contact submissions. Please try again later.'],
      [503, 'Submission verification is temporarily unavailable'],
    ] as const) {
      globalThis.fetch = async () => jsonResponse({ success: false, message }, { status })

      await assert.rejects(submitContact(submission), (error: unknown) => {
        assert.ok(error instanceof ApiError)
        assert.equal(error.kind, 'http')
        assert.equal(error.status, status)
        assert.equal(error.message, message)
        return true
      })
    }
  })

  it('normalizes transport failures and preserves request cancellation', async () => {
    const networkFailure = new TypeError('fetch failed')
    globalThis.fetch = async () => {
      throw networkFailure
    }

    await assert.rejects(submitContact(submission), (error: unknown) => {
      assert.ok(error instanceof ApiError)
      assert.equal(error.kind, 'network')
      assert.equal(error.cause, networkFailure)
      return true
    })

    const abortError = new DOMException('The operation was aborted.', 'AbortError')
    globalThis.fetch = async () => {
      throw abortError
    }

    await assert.rejects(
      submitContact(submission),
      (error: unknown) => error === abortError,
    )
  })

  it('rejects a successful response with an invalid command envelope', async () => {
    globalThis.fetch = async () => jsonResponse({ message: 'Missing success.' }, { status: 201 })

    await assert.rejects(
      submitContact(submission),
      (error: unknown) => error instanceof ApiError && error.kind === 'invalid-response',
    )
  })
})

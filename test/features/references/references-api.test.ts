import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'

import {
  deleteOwnedReference,
  getOwnedReference,
  getReferencesPage,
  submitReference,
} from '../../../src/features/references/api/references-api.ts'
import type {
  PublicReference,
  ReferenceSubmissionOwnership,
  SubmitReferenceInput,
} from '../../../src/features/references/model/reference.types.ts'

const originalFetch = globalThis.fetch
const referenceId = '68e7c0000000000000000001'
const managementToken = 'm'.repeat(43)

const publicReference: PublicReference = {
  id: referenceId,
  name: 'James Smith',
  company: 'SuperSauced',
  position: 'Founder',
  testimonial: 'Vadim turns ideas into reliable products.',
  ratings: { overall: 5, technical: 5, communication: 5 },
  publishedAt: '2026-10-14T12:00:00.000Z',
}

const submission: SubmitReferenceInput = {
  name: 'James Smith',
  email: 'james@example.com',
  company: 'SuperSauced',
  position: 'Founder',
  testimonial: 'Vadim turns ideas into reliable products.',
  ratings: { overall: 5, technical: 5, communication: 5 },
  turnstileToken: 'verified-turnstile-token',
  website: '',
}

const ownership: ReferenceSubmissionOwnership = { referenceId, managementToken }

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
  })
}

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('References API', () => {
  it('loads a page without changing backend order and forwards cancellation', async () => {
    const controller = new AbortController()
    const references = [
      publicReference,
      { ...publicReference, id: '68e7c0000000000000000002', name: 'Second Author' },
    ]
    let requestedInput: RequestInfo | URL | undefined
    let requestedSignal: AbortSignal | null | undefined

    globalThis.fetch = async (input, init) => {
      requestedInput = input
      requestedSignal = init?.signal
      return jsonResponse({
        success: true,
        message: 'References retrieved successfully.',
        data: {
          items: references,
          pagination: { page: 2, limit: 5, totalItems: 7, totalPages: 2 },
        },
      })
    }

    const result = await getReferencesPage({ page: 2, limit: 5 }, { signal: controller.signal })

    assert.equal(requestedInput, '/api/v1/references?page=2&limit=5')
    assert.equal(requestedSignal, controller.signal)
    assert.deepEqual(result.items.map(({ id }) => id), references.map(({ id }) => id))
  })

  it('submits the exact public input body', async () => {
    let requestedInput: RequestInfo | URL | undefined
    let requestedInit: RequestInit | undefined

    globalThis.fetch = async (input, init) => {
      requestedInput = input
      requestedInit = init
      return jsonResponse({
        success: true,
        message: 'Your reference was submitted for review.',
        data: {
          reference: {
            ...publicReference,
            status: 'pending',
            submittedAt: '2026-10-15T12:00:00.000Z',
            approvedAt: null,
          },
          managementToken,
        },
      })
    }

    const result = await submitReference(submission)

    assert.equal(requestedInput, '/api/v1/references')
    assert.equal(requestedInit?.method, 'POST')
    assert.equal(requestedInit?.body, JSON.stringify(submission))
    assert.equal(result.reference.status, 'pending')
    assert.equal(result.managementToken, managementToken)
  })

  it('uses the management token only in ownership headers', async () => {
    const requests: Array<{ input: RequestInfo | URL; init?: RequestInit }> = []

    globalThis.fetch = async (input, init) => {
      requests.push({ input, init })
      if (init?.method === 'DELETE') {
        return jsonResponse({ success: true, message: 'Reference submission deleted successfully.' })
      }

      return jsonResponse({
        success: true,
        message: 'Reference submission retrieved successfully.',
        data: {
          ...publicReference,
          status: 'pending',
          submittedAt: '2026-10-15T12:00:00.000Z',
          approvedAt: null,
        },
      })
    }

    await getOwnedReference(ownership)
    await deleteOwnedReference(ownership)

    assert.equal(requests[0]?.input, `/api/v1/references/submissions/${referenceId}`)
    assert.deepEqual(requests[0]?.init?.headers, {
      'X-Reference-Management-Token': managementToken,
      Accept: 'application/json',
    })
    assert.equal(requests[1]?.input, `/api/v1/references/${referenceId}/submission`)
    assert.equal(requests[1]?.init?.method, 'DELETE')
    assert.equal(requests[1]?.init?.body, undefined)
    assert.deepEqual(requests[1]?.init?.headers, {
      'X-Reference-Management-Token': managementToken,
      Accept: 'application/json',
    })
  })

  it('rejects invalid pagination and ownership before sending a request', async () => {
    let requested = false
    globalThis.fetch = async () => {
      requested = true
      return jsonResponse({ success: true, message: 'Unexpected.', data: null })
    }

    assert.throws(() => getReferencesPage({ page: 0, limit: 10 }), /positive integer/)
    assert.throws(() => getReferencesPage({ page: 1, limit: 51 }), /between 1 and 50/)
    assert.throws(
      () => getOwnedReference({ referenceId: 'invalid', managementToken }),
      /ID is invalid/,
    )
    assert.throws(
      () => deleteOwnedReference({ referenceId, managementToken: 'invalid' }),
      /token is invalid/,
    )
    assert.equal(requested, false)
  })
})

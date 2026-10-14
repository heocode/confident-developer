import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ApiError } from '../../../src/api/api-error.ts'
import {
  getConfirmedProfilePostEngagement,
  getOptimisticProfilePostEngagement,
  getProfileRequestErrorMessage,
  isStaleProfilePostRevision,
} from '../../../src/features/profile/model/profile-state.ts'

describe('Profile state', () => {
  it('optimistically adds and removes a like without allowing a negative count', () => {
    assert.deepEqual(getOptimisticProfilePostEngagement({ liked: false, likes: 4 }), {
      liked: true,
      likes: 5,
    })
    assert.deepEqual(getOptimisticProfilePostEngagement({ liked: true, likes: 4 }), {
      liked: false,
      likes: 3,
    })
    assert.deepEqual(getOptimisticProfilePostEngagement({ liked: true, likes: 0 }), {
      liked: false,
      likes: 0,
    })
  })

  it('uses the backend response as the final interaction state', () => {
    assert.deepEqual(
      getConfirmedProfilePostEngagement({ revision: 2, likes: 8, liked: true }),
      { likes: 8, liked: true },
    )
  })

  it('recognizes only an HTTP 409 as a stale revision', () => {
    assert.equal(
      isStaleProfilePostRevision(new ApiError('Stale.', { kind: 'http', status: 409 })),
      true,
    )
    assert.equal(
      isStaleProfilePostRevision(new ApiError('Unavailable.', { kind: 'http', status: 503 })),
      false,
    )
    assert.equal(isStaleProfilePostRevision(new TypeError('Unexpected.')), false)
  })

  it('keeps snapshot and profile errors contextual', () => {
    const networkError = new ApiError('Unable to reach the API.', { kind: 'network' })

    assert.equal(
      getProfileRequestErrorMessage(networkError, 'github'),
      'GitHub statistics are unavailable right now.',
    )
    assert.equal(
      getProfileRequestErrorMessage(networkError, 'profile'),
      'The profile service is unavailable right now. Please try again.',
    )
  })
})

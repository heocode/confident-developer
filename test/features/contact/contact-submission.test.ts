import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ApiError } from '../../../src/api/api-error.ts'
import {
  contactSubmissionReducer,
  getContactSubmissionFailure,
  INITIAL_CONTACT_SUBMISSION_STATE,
} from '../../../src/features/contact/model/contact-submission.ts'

describe('Contact submission state', () => {
  it('moves through submitting and success before an explicit reset', () => {
    const submitting = contactSubmissionReducer(INITIAL_CONTACT_SUBMISSION_STATE, {
      type: 'submit',
    })
    const success = contactSubmissionReducer(submitting, { type: 'succeed' })
    const reset = contactSubmissionReducer(success, { type: 'reset' })

    assert.deepEqual(submitting, { status: 'submitting' })
    assert.deepEqual(success, { status: 'success' })
    assert.deepEqual(reset, { status: 'idle' })
  })

  it('retains typed failure details until reset', () => {
    const failure = {
      reason: 'duplicate' as const,
      message: 'This inquiry was already submitted recently',
    }
    const error = contactSubmissionReducer(
      { status: 'submitting' },
      { type: 'fail', failure },
    )

    assert.deepEqual(error, { status: 'error', ...failure })
    assert.deepEqual(contactSubmissionReducer(error, { type: 'reset' }), { status: 'idle' })
  })

  it('does not reset an active submission', () => {
    const submitting = { status: 'submitting' } as const

    assert.equal(contactSubmissionReducer(submitting, { type: 'reset' }), submitting)
  })
})

describe('Contact submission failures', () => {
  it('classifies safe public API errors by status', () => {
    for (const [status, reason, message] of [
      [400, 'validation', 'Submission verification failed'],
      [409, 'duplicate', 'This inquiry was already submitted recently'],
      [429, 'rate-limit', 'Too many contact submissions. Please try again later.'],
      [503, 'unavailable', 'Submission verification is temporarily unavailable'],
    ] as const) {
      assert.deepEqual(
        getContactSubmissionFailure(new ApiError(message, { kind: 'http', status })),
        { reason, message },
      )
    }
  })

  it('uses contextual messages for network and invalid-response failures', () => {
    assert.deepEqual(
      getContactSubmissionFailure(new ApiError('Unable to reach the API.', { kind: 'network' })),
      {
        reason: 'network',
        message: 'The contact service is unavailable right now. Please try again.',
      },
    )
    assert.deepEqual(
      getContactSubmissionFailure(
        new ApiError('Private transport detail', { kind: 'invalid-response' }),
      ),
      {
        reason: 'unexpected',
        message: 'The contact service returned an unexpected response. Please try again.',
      },
    )
  })

  it('does not expose unknown errors or unhandled HTTP messages', () => {
    const unknownFailure = getContactSubmissionFailure(
      new Error('Private inquiry content should not be visible'),
    )
    const unhandledHttpFailure = getContactSubmissionFailure(
      new ApiError('Private server detail', { kind: 'http', status: 500 }),
    )

    assert.deepEqual(unknownFailure, {
      reason: 'unexpected',
      message: 'Your inquiry could not be sent. Please try again.',
    })
    assert.deepEqual(unhandledHttpFailure, unknownFailure)
  })
})

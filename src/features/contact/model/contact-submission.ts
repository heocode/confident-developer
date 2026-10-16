import { ApiError } from '../../../api/api-error.ts'

export type ContactSubmissionFailureReason =
  | 'validation'
  | 'duplicate'
  | 'rate-limit'
  | 'unavailable'
  | 'network'
  | 'unexpected'

export interface ContactSubmissionFailure {
  reason: ContactSubmissionFailureReason
  message: string
}

export type ContactSubmissionState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | ({ status: 'error' } & ContactSubmissionFailure)

export type ContactSubmissionAction =
  | { type: 'submit' }
  | { type: 'succeed' }
  | { type: 'fail'; failure: ContactSubmissionFailure }
  | { type: 'reset' }

export const INITIAL_CONTACT_SUBMISSION_STATE: ContactSubmissionState = { status: 'idle' }

const FALLBACK_ERROR_MESSAGE = 'Your inquiry could not be sent. Please try again.'

export function getContactSubmissionFailure(error: unknown): ContactSubmissionFailure {
  if (!(error instanceof ApiError)) {
    return { reason: 'unexpected', message: FALLBACK_ERROR_MESSAGE }
  }

  if (error.kind === 'network') {
    return {
      reason: 'network',
      message: 'The contact service is unavailable right now. Please try again.',
    }
  }

  if (error.kind === 'invalid-response') {
    return {
      reason: 'unexpected',
      message: 'The contact service returned an unexpected response. Please try again.',
    }
  }

  const reasonsByStatus: Partial<Record<number, ContactSubmissionFailureReason>> = {
    400: 'validation',
    409: 'duplicate',
    429: 'rate-limit',
    503: 'unavailable',
  }
  const reason = error.status === undefined ? undefined : reasonsByStatus[error.status]

  return reason
    ? { reason, message: error.message }
    : { reason: 'unexpected', message: FALLBACK_ERROR_MESSAGE }
}

export function contactSubmissionReducer(
  state: ContactSubmissionState,
  action: ContactSubmissionAction,
): ContactSubmissionState {
  switch (action.type) {
    case 'submit':
      return { status: 'submitting' }
    case 'succeed':
      return { status: 'success' }
    case 'fail':
      return { status: 'error', ...action.failure }
    case 'reset':
      return state.status === 'submitting' ? state : INITIAL_CONTACT_SUBMISSION_STATE
  }
}

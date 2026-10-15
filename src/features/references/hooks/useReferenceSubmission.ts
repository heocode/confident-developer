import { useCallback, useEffect, useRef, useState } from 'react'

import { ApiError } from '../../../api/api-error.ts'
import { submitReference } from '../api/references-api.ts'
import type { OwnedReference, SubmitReferenceInput } from '../model/reference.types.ts'
import { writeReferenceSubmissionOwnership } from '../storage/reference-submission-storage.ts'

interface SuccessfulSubmission {
  reference: OwnedReference
  ownershipSaved: boolean
}

export type ReferenceSubmissionState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'error'; message: string }
  | ({ status: 'success' } & SuccessfulSubmission)

function getSubmissionErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return 'Your reference could not be submitted. Please try again.'
  if (error.kind === 'network') return 'The reference service is unavailable right now. Please try again.'
  if (error.kind === 'invalid-response') return 'The reference service returned an unexpected response. Please try again.'
  return error.message
}

export function useReferenceSubmission() {
  const [state, setState] = useState<ReferenceSubmissionState>({ status: 'idle' })
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(
    () => () => {
      controllerRef.current?.abort()
    },
    [],
  )

  const submit = useCallback(async (input: SubmitReferenceInput) => {
    if (controllerRef.current) return false

    const controller = new AbortController()
    controllerRef.current = controller
    setState({ status: 'submitting' })

    try {
      const result = await submitReference(input, { signal: controller.signal })
      if (controller.signal.aborted) return false

      const ownershipSaved = writeReferenceSubmissionOwnership({
        referenceId: result.reference.id,
        managementToken: result.managementToken,
      })
      setState({ status: 'success', reference: result.reference, ownershipSaved })
      return true
    } catch (error) {
      if (controller.signal.aborted) return false
      setState({ status: 'error', message: getSubmissionErrorMessage(error) })
      return false
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null
    }
  }, [])

  const clearError = useCallback(() => {
    setState((current) => (current.status === 'error' ? { status: 'idle' } : current))
  }, [])

  return { clearError, state, submit }
}

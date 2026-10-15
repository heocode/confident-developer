import { useCallback, useEffect, useRef, useState } from 'react'

import { ApiError } from '../../../api/api-error.ts'
import {
  deleteOwnedReference,
  getOwnedReference,
  submitReference,
} from '../api/references-api.ts'
import type {
  OwnedReference,
  ReferenceSubmissionOwnership,
  SubmitReferenceInput,
} from '../model/reference.types.ts'
import {
  clearReferenceSubmissionOwnership,
  readReferenceSubmissionOwnership,
  writeReferenceSubmissionOwnership,
} from '../storage/reference-submission-storage.ts'

interface OwnedSubmission {
  reference: OwnedReference
  ownershipSaved: boolean
}

export type ReferenceSubmissionState =
  | { status: 'restoring' }
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'submission-error'; message: string }
  | ({ status: 'owned' } & OwnedSubmission)
  | ({ status: 'withdrawing' } & OwnedSubmission)
  | ({ status: 'withdraw-error'; message: string } & OwnedSubmission)
  | { status: 'restore-error'; message: string }

function getSubmissionErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return 'Your reference could not be submitted. Please try again.'
  if (error.kind === 'network') return 'The reference service is unavailable right now. Please try again.'
  if (error.kind === 'invalid-response') return 'The reference service returned an unexpected response. Please try again.'
  return error.message
}

function getRestoreErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.kind === 'invalid-response') {
    return 'The reference service returned an unexpected response. Please try again.'
  }

  return 'Your submitted reference could not be restored right now. Please try again.'
}

function getWithdrawErrorMessage(error: unknown, action: 'delete' | 'withdraw') {
  if (error instanceof ApiError && error.kind === 'invalid-response') {
    return 'The reference service returned an unexpected response. Please try again.'
  }

  const verb = action === 'delete' ? 'deleted' : 'withdrawn'
  return `Your reference could not be ${verb}. Please try again.`
}

function isMissingOwnedReference(error: unknown) {
  return error instanceof ApiError && error.kind === 'http' && error.status === 404
}

export function useReferenceSubmission() {
  const [state, setState] = useState<ReferenceSubmissionState>({ status: 'restoring' })
  const controllerRef = useRef<AbortController | null>(null)
  const ownershipRef = useRef<ReferenceSubmissionOwnership | null>(null)

  const restore = useCallback(async () => {
    if (controllerRef.current) return

    const ownership = readReferenceSubmissionOwnership()
    if (!ownership) {
      ownershipRef.current = null
      setState({ status: 'idle' })
      return
    }

    const controller = new AbortController()
    controllerRef.current = controller
    ownershipRef.current = ownership
    setState({ status: 'restoring' })

    try {
      const reference = await getOwnedReference(ownership, { signal: controller.signal })
      if (controller.signal.aborted) return

      if (reference.status === 'approved') {
        clearReferenceSubmissionOwnership()
        ownershipRef.current = null
        setState({ status: 'idle' })
        return
      }

      setState({ status: 'owned', reference, ownershipSaved: true })
    } catch (error) {
      if (controller.signal.aborted) return

      if (isMissingOwnedReference(error)) {
        clearReferenceSubmissionOwnership()
        ownershipRef.current = null
        setState({ status: 'idle' })
        return
      }

      setState({ status: 'restore-error', message: getRestoreErrorMessage(error) })
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null
    }
  }, [])

  useEffect(() => {
    let active = true
    queueMicrotask(() => {
      if (active) void restore()
    })

    return () => {
      active = false
      const controller = controllerRef.current
      controller?.abort()
      if (controllerRef.current === controller) controllerRef.current = null
    }
  }, [restore])

  const submit = useCallback(async (input: SubmitReferenceInput) => {
    if (controllerRef.current || ownershipRef.current) return false

    const controller = new AbortController()
    controllerRef.current = controller
    setState({ status: 'submitting' })

    try {
      const result = await submitReference(input, { signal: controller.signal })
      if (controller.signal.aborted) return false

      const ownership = {
        referenceId: result.reference.id,
        managementToken: result.managementToken,
      }
      ownershipRef.current = ownership
      const ownershipSaved = writeReferenceSubmissionOwnership(ownership)
      setState({ status: 'owned', reference: result.reference, ownershipSaved })
      return true
    } catch (error) {
      if (controller.signal.aborted) return false
      setState({ status: 'submission-error', message: getSubmissionErrorMessage(error) })
      return false
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null
    }
  }, [])

  const withdraw = useCallback(async () => {
    if (controllerRef.current || !ownershipRef.current) return false
    if (state.status !== 'owned' && state.status !== 'withdraw-error') return false

    const ownedSubmission: OwnedSubmission = {
      reference: state.reference,
      ownershipSaved: state.ownershipSaved,
    }
    setState({ status: 'withdrawing', ...ownedSubmission })

    const controller = new AbortController()
    const ownership = ownershipRef.current
    controllerRef.current = controller

    try {
      await deleteOwnedReference(ownership, { signal: controller.signal })
      if (controller.signal.aborted) return false

      clearReferenceSubmissionOwnership()
      ownershipRef.current = null
      setState({ status: 'idle' })
      return true
    } catch (error) {
      if (controller.signal.aborted) return false

      if (isMissingOwnedReference(error)) {
        clearReferenceSubmissionOwnership()
        ownershipRef.current = null
        setState({ status: 'idle' })
        return true
      }

      const { reference, ownershipSaved } = ownedSubmission
      setState({
        status: 'withdraw-error',
        message: getWithdrawErrorMessage(
          error,
          reference.status === 'rejected' ? 'delete' : 'withdraw',
        ),
        reference,
        ownershipSaved,
      })
      return false
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null
    }
  }, [state])

  const clearSubmissionError = useCallback(() => {
    setState((current) =>
      current.status === 'submission-error' ? { status: 'idle' } : current,
    )
  }, [])

  const clearWithdrawError = useCallback(() => {
    setState((current) =>
      current.status === 'withdraw-error'
        ? {
            status: 'owned',
            reference: current.reference,
            ownershipSaved: current.ownershipSaved,
          }
        : current,
    )
  }, [])

  return {
    clearSubmissionError,
    clearWithdrawError,
    restore,
    state,
    submit,
    withdraw,
  }
}

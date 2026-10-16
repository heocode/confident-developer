import { useCallback, useEffect, useReducer, useRef } from 'react'

import { submitContact } from '../api/contact-api.ts'
import {
  contactSubmissionReducer,
  getContactSubmissionFailure,
  INITIAL_CONTACT_SUBMISSION_STATE,
} from '../model/contact-submission.ts'
import type { SubmitContactInput } from '../model/contact.types.ts'

export function useContactSubmission() {
  const [state, dispatch] = useReducer(
    contactSubmissionReducer,
    INITIAL_CONTACT_SUBMISSION_STATE,
  )
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(
    () => () => {
      controllerRef.current?.abort()
      controllerRef.current = null
    },
    [],
  )

  const submit = useCallback(async (input: SubmitContactInput) => {
    if (controllerRef.current || state.status === 'success') return false

    const controller = new AbortController()
    controllerRef.current = controller
    dispatch({ type: 'submit' })

    try {
      await submitContact(input, { signal: controller.signal })
      if (controller.signal.aborted) return false

      dispatch({ type: 'succeed' })
      return true
    } catch (error) {
      if (controller.signal.aborted) return false

      dispatch({ type: 'fail', failure: getContactSubmissionFailure(error) })
      return false
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null
    }
  }, [state.status])

  const reset = useCallback(() => {
    if (!controllerRef.current) dispatch({ type: 'reset' })
  }, [])

  return { reset, state, submit }
}

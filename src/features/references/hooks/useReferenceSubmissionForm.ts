import { useState } from 'react'

import {
  EMPTY_REFERENCE_SUBMISSION_DETAILS,
  hasReferenceSubmissionErrors,
  validateReferenceSubmission,
} from '../model/reference-submission-form.ts'
import type {
  ReferenceSubmissionDetails,
  ReferenceSubmissionErrors,
  ReferenceSubmissionTextField,
} from '../model/reference-submission-form.ts'

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? ''

interface ReferenceSubmissionFormOptions {
  testimonial: string
  onSubmit: (details: ReferenceSubmissionDetails, turnstileToken: string) => Promise<boolean>
}

export function useReferenceSubmissionForm({ testimonial, onSubmit }: ReferenceSubmissionFormOptions) {
  const [details, setDetails] = useState<ReferenceSubmissionDetails>(() => ({
    ...EMPTY_REFERENCE_SUBMISSION_DETAILS,
    ratings: { ...EMPTY_REFERENCE_SUBMISSION_DETAILS.ratings },
  }))
  const [errors, setErrors] = useState<ReferenceSubmissionErrors>({})
  const [turnstileError, setTurnstileError] = useState<string | null>(() =>
    TURNSTILE_SITE_KEY ? null : 'Reference publishing is not configured right now.',
  )
  const [turnstileRevision, setTurnstileRevision] = useState(0)
  const [turnstileToken, setTurnstileToken] = useState('')
  const isFormComplete =
    details.name.trim().length > 0 &&
    details.email.trim().length > 0 &&
    details.company.trim().length > 0 &&
    details.position.trim().length > 0 &&
    Object.values(details.ratings).every((rating) => rating > 0)

  function clearFieldError(field: keyof ReferenceSubmissionErrors) {
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  function updateTextField(name: ReferenceSubmissionTextField, value: string) {
    setDetails((current) => ({ ...current, [name]: value }))
    clearFieldError(name)
  }

  function updateRating(name: keyof ReferenceSubmissionDetails['ratings'], value: number) {
    setDetails((current) => ({
      ...current,
      ratings: { ...current.ratings, [name]: value },
    }))
    clearFieldError(name)
  }

  function resetSecurityCheck() {
    setTurnstileToken('')
    setTurnstileError(
      TURNSTILE_SITE_KEY ? null : 'Reference publishing is not configured right now.',
    )
  }

  function handleTurnstileError() {
    setTurnstileToken('')
    setTurnstileError('The security check is unavailable. Please try again.')
  }

  function handleTurnstileToken(token: string) {
    setTurnstileToken(token)
    if (token) setTurnstileError(null)
  }

  async function submit(): Promise<'invalid' | 'security-required' | 'submitted' | 'failed'> {
    const nextErrors = validateReferenceSubmission(testimonial, details)
    setErrors(nextErrors)
    if (hasReferenceSubmissionErrors(nextErrors)) return 'invalid'

    if (!turnstileToken) {
      setTurnstileError('Please wait for the security check and try again.')
      return 'security-required'
    }

    const submitted = await onSubmit(details, turnstileToken)
    setTurnstileToken('')
    if (!submitted) setTurnstileRevision((revision) => revision + 1)
    return submitted ? 'submitted' : 'failed'
  }

  return {
    details,
    errors,
    isFormComplete,
    siteKey: TURNSTILE_SITE_KEY,
    turnstileError,
    turnstileRevision,
    clearFieldError,
    handleTurnstileError,
    handleTurnstileToken,
    resetSecurityCheck,
    submit,
    updateRating,
    updateTextField,
  }
}

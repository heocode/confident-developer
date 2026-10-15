import { useEffect, useRef, useState } from 'react'

import {
  EMPTY_REFERENCE_SUBMISSION_DETAILS,
  hasReferenceSubmissionErrors,
  validateReferenceSubmission,
} from '../model/reference-submission-form.ts'
import type {
  ReferenceSubmissionDetails,
  ReferenceSubmissionErrors,
  ReferenceSubmissionField,
} from '../model/reference-submission-form.ts'
import styles from './ReferenceSubmission.module.css'
import { ReferenceRatingInput } from './ReferenceRatingInput.tsx'
import { ReferenceTurnstile } from './ReferenceTurnstile.tsx'

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? ''

type TextFieldName = 'name' | 'email' | 'company' | 'position'

interface ReferenceSubmissionModalProps {
  isOpen: boolean
  isSubmitting: boolean
  submissionErrorMessage: string | null
  testimonial: string
  onClose: () => void
  onSubmit: (details: ReferenceSubmissionDetails, turnstileToken: string) => Promise<boolean>
}

interface TextFieldProps {
  autoComplete: string
  errorMessage?: string
  label: string
  maxLength: number
  name: TextFieldName
  placeholder: string
  type?: 'email' | 'text'
  value: string
  onChange: (name: TextFieldName, value: string) => void
}

function TextField({
  autoComplete,
  errorMessage,
  label,
  maxLength,
  name,
  placeholder,
  type = 'text',
  value,
  onChange,
}: TextFieldProps) {
  const errorId = `${name}-reference-error`

  return (
    <label className={styles.textField}>
      <span>{label}</span>
      <input
        aria-describedby={errorMessage ? errorId : undefined}
        aria-invalid={Boolean(errorMessage)}
        autoComplete={autoComplete}
        maxLength={maxLength}
        name={name}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
      />
      {errorMessage && (
        <span className={styles.fieldError} id={errorId}>
          {errorMessage}
        </span>
      )}
    </label>
  )
}

export function ReferenceSubmissionModal({
  isOpen,
  isSubmitting,
  submissionErrorMessage,
  testimonial,
  onClose,
  onSubmit,
}: ReferenceSubmissionModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
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

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = previousOverflow
    }
  }, [isOpen])

  function clearFieldError(field: ReferenceSubmissionField) {
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  function updateTextField(name: TextFieldName, value: string) {
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

  function closeModal() {
    setTurnstileToken('')
    setTurnstileError(
      TURNSTILE_SITE_KEY ? null : 'Reference publishing is not configured right now.',
    )
    onClose()
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateReferenceSubmission(testimonial, details)
    setErrors(nextErrors)

    if (hasReferenceSubmissionErrors(nextErrors)) {
      window.requestAnimationFrame(() => {
        const invalidField = dialogRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], input[type="radio"]')
        invalidField?.focus()
      })
      return
    }

    if (!turnstileToken) {
      setTurnstileError('Please wait for the security check and try again.')
      return
    }

    const submitted = await onSubmit(details, turnstileToken)
    if (submitted) {
      setTurnstileToken('')
    } else {
      setTurnstileToken('')
      setTurnstileRevision((revision) => revision + 1)
    }
  }

  return (
    <dialog
      className={styles.modal}
      ref={dialogRef}
      aria-labelledby="reference-submission-title"
      onCancel={(event) => {
        if (isSubmitting) {
          event.preventDefault()
          return
        }
        closeModal()
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget || isSubmitting) return
        const bounds = event.currentTarget.getBoundingClientRect()
        const isInside =
          event.clientX >= bounds.left &&
          event.clientX <= bounds.right &&
          event.clientY >= bounds.top &&
          event.clientY <= bounds.bottom
        if (!isInside) closeModal()
      }}
    >
      <h3 id="reference-submission-title">Few more details before publishing</h3>

      <form className={styles.modalForm} noValidate onSubmit={handleSubmit}>
        <div className={styles.textFields}>
          <TextField
            autoComplete="name"
            errorMessage={errors.name}
            label="NAME"
            maxLength={80}
            name="name"
            placeholder="Your name"
            value={details.name}
            onChange={updateTextField}
          />
          <TextField
            autoComplete="email"
            errorMessage={errors.email}
            label="EMAIL"
            maxLength={254}
            name="email"
            placeholder="Your email (It will never be displayed publicly)"
            type="email"
            value={details.email}
            onChange={updateTextField}
          />
          <TextField
            autoComplete="organization"
            errorMessage={errors.company}
            label="COMPANY"
            maxLength={120}
            name="company"
            placeholder="Company or organization"
            value={details.company}
            onChange={updateTextField}
          />
          <TextField
            autoComplete="organization-title"
            errorMessage={errors.position}
            label="POSITION"
            maxLength={120}
            name="position"
            placeholder="Your role or position"
            value={details.position}
            onChange={updateTextField}
          />
        </div>

        <div className={styles.ratingFields}>
          <ReferenceRatingInput
            errorMessage={errors.overall}
            label="OVERALL EXPERIENCE"
            name="overall"
            value={details.ratings.overall}
            onChange={(value) => updateRating('overall', value)}
          />
          <ReferenceRatingInput
            errorMessage={errors.technical}
            label="TECHNICAL SKILLS"
            name="technical"
            value={details.ratings.technical}
            onChange={(value) => updateRating('technical', value)}
          />
          <ReferenceRatingInput
            errorMessage={errors.communication}
            label="COMMUNICATION"
            name="communication"
            value={details.ratings.communication}
            onChange={(value) => updateRating('communication', value)}
          />
        </div>

        {isOpen && TURNSTILE_SITE_KEY && (
          <ReferenceTurnstile
            revision={turnstileRevision}
            siteKey={TURNSTILE_SITE_KEY}
            onError={() => {
              setTurnstileToken('')
              setTurnstileError('The security check is unavailable. Please try again.')
            }}
            onToken={(token) => {
              setTurnstileToken(token)
              if (token) setTurnstileError(null)
            }}
          />
        )}

        {(turnstileError || submissionErrorMessage) && (
          <p className={styles.formError} role="alert">
            {submissionErrorMessage ?? turnstileError}
          </p>
        )}

        <button
          className={styles.publishButton}
          type="submit"
          disabled={isSubmitting || !TURNSTILE_SITE_KEY}
        >
          {isSubmitting ? 'Publishing…' : 'Publish'}
        </button>
      </form>
    </dialog>
  )
}

import { useEffect, useRef, useState } from 'react'

import { TurnstileWidget } from '../../../components/anti-spam/TurnstileWidget.tsx'
import { useContactSubmission } from '../hooks/useContactSubmission.ts'
import {
  createContactSubmissionInput,
  EMPTY_CONTACT_FORM,
  hasContactFormErrors,
  validateContactForm,
} from '../model/contact-form.ts'
import type {
  ContactFormErrors,
  ContactFormField,
  ContactFormValues,
} from '../model/contact-form.ts'
import type { ContactBudget, ContactScope } from '../model/contact.types.ts'
import {
  CONTACT_BUDGET_OPTIONS,
  CONTACT_SCOPE_OPTIONS,
} from '../presentation/contact-options.ts'
import { ContactChoiceGroup } from './ContactChoiceGroup.tsx'
import styles from './ContactForm.module.css'

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? ''

interface ContactFormProps {
  usesDocumentScroll?: boolean
  layout?: 'flow' | 'panel'
  autoFocus?: boolean
  titleId?: string
  onClose?: () => void
  onSubmittingChange?: (isSubmitting: boolean) => void
}

function createEmptyForm(): ContactFormValues {
  return { ...EMPTY_CONTACT_FORM, scopes: [] }
}

export function ContactForm({
  usesDocumentScroll = false,
  layout = 'flow',
  autoFocus = false,
  titleId = 'contact-form-title',
  onClose,
  onSubmittingChange,
}: ContactFormProps) {
  const { reset, state: submissionState, submit } = useContactSubmission()
  const successHeadingRef = useRef<HTMLHeadingElement>(null)
  const [values, setValues] = useState(createEmptyForm)
  const [errors, setErrors] = useState<ContactFormErrors>({})
  const [turnstileRevision, setTurnstileRevision] = useState(0)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileError, setTurnstileError] = useState<string | null>(() =>
    TURNSTILE_SITE_KEY ? null : 'Contact submissions are not configured right now.',
  )
  const isSubmitting = submissionState.status === 'submitting'

  useEffect(() => {
    onSubmittingChange?.(isSubmitting)
    return () => onSubmittingChange?.(false)
  }, [isSubmitting, onSubmittingChange])

  useEffect(() => {
    if (submissionState.status !== 'success') return
    successHeadingRef.current?.focus()
  }, [submissionState.status])

  function clearError(field: ContactFormField) {
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
    if (submissionState.status === 'error') reset()
  }

  function updateTextField(field: 'email' | 'message' | 'name', value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    clearError(field)
  }

  function toggleScope(scope: ContactScope) {
    setValues((current) => ({
      ...current,
      scopes: current.scopes.includes(scope)
        ? current.scopes.filter((value) => value !== scope)
        : [...current.scopes, scope],
    }))
    clearError('scopes')
  }

  function selectBudget(budget: ContactBudget) {
    setValues((current) => ({ ...current, budget }))
    clearError('budget')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const nextErrors = validateContactForm(values)
    setErrors(nextErrors)

    if (hasContactFormErrors(nextErrors)) {
      window.requestAnimationFrame(() => {
        form
          .querySelector<HTMLElement>('[aria-invalid="true"] input, input[aria-invalid="true"], textarea[aria-invalid="true"]')
          ?.focus()
      })
      return
    }

    if (!turnstileToken) {
      setTurnstileError('Please wait for the security check and try again.')
      return
    }

    const submitted = await submit(createContactSubmissionInput(values, turnstileToken))
    if (!submitted) {
      setTurnstileToken('')
      setTurnstileRevision((revision) => revision + 1)
    }
  }

  if (submissionState.status === 'success') {
    return (
      <div className={styles.success} role="status" aria-live="polite">
        <p className={styles.successEyebrow}>MESSAGE SENT</p>
        <h2 id={titleId} ref={successHeadingRef} tabIndex={-1}>
          Thanks for reaching out.
        </h2>
        <p>I’ll get back to you as soon as I can.</p>
        {onClose && (
          <button type="button" onClick={onClose}>
            Close
          </button>
        )}
      </div>
    )
  }

  const formError =
    submissionState.status === 'error' ? submissionState.message : turnstileError

  return (
    <form
      className={[
        styles.form,
        layout === 'panel' ? styles.panelForm : '',
        usesDocumentScroll ? styles.documentFlow : '',
      ].filter(Boolean).join(' ')}
      aria-labelledby={titleId}
      noValidate
      onSubmit={(event) => void handleSubmit(event)}
    >
      <h2 className={styles.visuallyHidden} id={titleId}>
        Contact me
      </h2>

      <div className={styles.identityFields}>
        <label className={styles.textField}>
          <span>NAME</span>
          <input
            aria-describedby={errors.name ? 'name-contact-error' : undefined}
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
            autoFocus={autoFocus}
            maxLength={80}
            name="name"
            placeholder="Your name"
            value={values.name}
            onChange={(event) => updateTextField('name', event.target.value)}
          />
          {errors.name && (
            <span className={styles.fieldError} id="name-contact-error">
              {errors.name}
            </span>
          )}
        </label>

        <label className={styles.textField}>
          <span>EMAIL</span>
          <input
            aria-describedby={errors.email ? 'email-contact-error' : undefined}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            maxLength={254}
            name="email"
            placeholder="Your email"
            type="email"
            value={values.email}
            onChange={(event) => updateTextField('email', event.target.value)}
          />
          {errors.email && (
            <span className={styles.fieldError} id="email-contact-error">
              {errors.email}
            </span>
          )}
        </label>
      </div>

      <label className={`${styles.textField} ${styles.messageField}`}>
        <span>TELL ME ABOUT YOUR STUFF</span>
        <textarea
          aria-describedby={errors.message ? 'message-contact-error' : undefined}
          aria-invalid={Boolean(errors.message)}
          maxLength={5_000}
          name="message"
          placeholder="Tell me about your stuff..."
          value={values.message}
          onChange={(event) => updateTextField('message', event.target.value)}
        />
        {errors.message && (
          <span className={styles.fieldError} id="message-contact-error">
            {errors.message}
          </span>
        )}
      </label>

      <ContactChoiceGroup
        errorMessage={errors.scopes}
        inputType="checkbox"
        label="SCOPE OF WORK"
        name="contact-scopes"
        options={CONTACT_SCOPE_OPTIONS}
        selectedValues={values.scopes}
        onSelect={toggleScope}
      />

      <ContactChoiceGroup
        errorMessage={errors.budget}
        inputType="radio"
        label="BUDGET"
        name="contact-budget"
        options={CONTACT_BUDGET_OPTIONS}
        selectedValues={values.budget ? [values.budget] : []}
        onSelect={selectBudget}
      />

      <div className={styles.feedback}>
        {TURNSTILE_SITE_KEY && (
          <TurnstileWidget
            action="contact_submit"
            className={styles.turnstileSlot}
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

        {formError && (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        )}
      </div>

      <button
        className={styles.submitButton}
        type="submit"
        aria-busy={isSubmitting}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Sending…' : 'Send'}
      </button>
    </form>
  )
}

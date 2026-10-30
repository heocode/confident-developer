import { useRef } from 'react'
import type { FormEvent } from 'react'

import sendIconUrl from '../../../assets/icons/references/send.svg'
import type { ReferenceSubmissionState } from '../hooks/useReferenceSubmission.ts'
import { useReferenceSubmissionForm } from '../hooks/useReferenceSubmissionForm.ts'
import type { ReferenceSubmissionDetails } from '../model/reference-submission-form.ts'
import { ReferenceSubmissionFields } from './ReferenceSubmissionFields.tsx'
import { ReferenceTurnstile } from './ReferenceTurnstile.tsx'
import styles from './ReferenceSubmissionForm.module.css'

interface ReferenceSubmissionFormProps {
  usesDocumentScroll?: boolean
  state: ReferenceSubmissionState
  testimonial: string
  onTestimonialChange: (value: string) => void
  onSubmit: (details: ReferenceSubmissionDetails, turnstileToken: string) => Promise<boolean>
  onRetryRestore: () => void
}

export function ReferenceSubmissionForm({
  usesDocumentScroll = false,
  state,
  testimonial,
  onTestimonialChange,
  onSubmit,
  onRetryRestore,
}: ReferenceSubmissionFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const form = useReferenceSubmissionForm({ testimonial, onSubmit })
  const isSubmitting = state.status === 'submitting'
  const isDisabled = state.status !== 'idle' && state.status !== 'submission-error'
  const ownedReference =
    state.status === 'owned' || state.status === 'withdrawing' || state.status === 'withdraw-error'
      ? state.reference
      : null
  const errorMessage = state.status === 'submission-error' ? state.message : form.turnstileError

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isDisabled) return

    const result = await form.submit()
    if (result === 'invalid') {
      window.requestAnimationFrame(() => {
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      })
    }
    if (result === 'submitted') form.resetFields()
  }

  return (
    <form
      className={`${styles.form}${usesDocumentScroll ? ` ${styles.documentFlow}` : ''}`}
      noValidate
      onSubmit={handleSubmit}
      ref={formRef}
      aria-label="Leave a reference"
      aria-busy={isSubmitting}
    >
      <fieldset className={styles.fields} disabled={isDisabled}>
        <legend className={styles.visuallyHidden}>Your reference</legend>
        <div className={styles.controls}>
          <ReferenceSubmissionFields
            textFieldsClassName={styles.textFields}
            ratingFieldsClassName={styles.ratingFields}
            details={form.details}
            errors={form.errors}
            onTextFieldChange={form.updateTextField}
            onRatingChange={form.updateRating}
          />

          <div className={styles.messageField}>
            <label htmlFor="reference-page-testimonial">YOUR OPINION</label>
            <div className={styles.messageSurface}>
              <textarea
                id="reference-page-testimonial"
                name="testimonial"
                maxLength={1500}
                placeholder="Start typing..."
                aria-invalid={Boolean(form.errors.testimonial)}
                aria-describedby={form.errors.testimonial ? 'reference-page-testimonial-error' : undefined}
                value={testimonial}
                onChange={(event) => {
                  onTestimonialChange(event.target.value)
                  form.clearFieldError('testimonial')
                }}
              />
              <button
                className={styles.sendButton}
                type="submit"
                aria-label={isSubmitting ? 'Submitting reference' : 'Submit reference'}
                disabled={isDisabled || !form.siteKey}
              >
                <img src={sendIconUrl} alt="" />
              </button>
            </div>
            {form.errors.testimonial && (
              <p className={styles.error} id="reference-page-testimonial-error">
                {form.errors.testimonial}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      <div className={styles.feedback}>
        {(!isDisabled || isSubmitting) && form.siteKey && (
          <ReferenceTurnstile
            revision={form.turnstileRevision}
            siteKey={form.siteKey}
            onError={form.handleTurnstileError}
            onToken={form.handleTurnstileToken}
          />
        )}

        {state.status === 'restoring' && (
          <p className={styles.notice} role="status">Restoring your reference…</p>
        )}
        {isSubmitting && (
          <p className={styles.notice} role="status">Submitting your reference…</p>
        )}
        {ownedReference && (
          <div className={styles.notice} role="status">
            <p>
              {ownedReference.status === 'rejected'
                ? 'Your reference was not approved. You can delete it from the guestbook before submitting another.'
                : 'Reference sent for review. It will be visible publicly once approved. You can withdraw it from the guestbook.'}
            </p>
            {state.status === 'owned' && !state.ownershipSaved && (
              <p>Your reference was submitted, but this browser could not save withdrawal access.</p>
            )}
          </div>
        )}
        {state.status === 'restore-error' && (
          <div className={styles.notice} role="alert">
            <p>{state.message}</p>
            <button type="button" onClick={onRetryRestore}>Try again</button>
          </div>
        )}
        {!isDisabled && errorMessage && <p className={styles.error} role="alert">{errorMessage}</p>}
      </div>
    </form>
  )
}

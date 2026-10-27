import { useEffect, useRef } from 'react'

import { DialogCloseButton } from '../../../components/dialog/DialogCloseButton.tsx'
import { useModalPageLock } from '../../../components/dialog/useModalPageLock.ts'
import { useReferenceSubmissionForm } from '../hooks/useReferenceSubmissionForm.ts'
import type { ReferenceSubmissionDetails } from '../model/reference-submission-form.ts'
import styles from './ReferenceSubmission.module.css'
import { ReferenceSubmissionFields } from './ReferenceSubmissionFields.tsx'
import { ReferenceTurnstile } from './ReferenceTurnstile.tsx'

interface ReferenceSubmissionModalProps {
  isOpen: boolean
  isSubmitting: boolean
  submissionErrorMessage: string | null
  testimonial: string
  onClose: () => void
  onSubmit: (details: ReferenceSubmissionDetails, turnstileToken: string) => Promise<boolean>
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
  const form = useReferenceSubmissionForm({ testimonial, onSubmit })
  useModalPageLock(isOpen)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  function closeModal() {
    form.resetSecurityCheck()
    onClose()
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = await form.submit()
    if (result === 'invalid') {
      window.requestAnimationFrame(() => {
        const invalidField = dialogRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], input[type="radio"]')
        invalidField?.focus()
      })
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
      <DialogCloseButton
        className={styles.closeButton}
        disabled={isSubmitting}
        label="Close reference form"
        onClick={closeModal}
      />

      <h3 id="reference-submission-title">Few more details before publishing</h3>

      <form className={styles.modalForm} noValidate onSubmit={handleSubmit}>
        <ReferenceSubmissionFields
          details={form.details}
          errors={form.errors}
          onTextFieldChange={form.updateTextField}
          onRatingChange={form.updateRating}
        />

        {isOpen && form.siteKey && (
          <ReferenceTurnstile
            revision={form.turnstileRevision}
            siteKey={form.siteKey}
            onError={form.handleTurnstileError}
            onToken={form.handleTurnstileToken}
          />
        )}

        {(form.turnstileError || submissionErrorMessage) && (
          <p className={styles.formError} role="alert">
            {submissionErrorMessage ?? form.turnstileError}
          </p>
        )}

        <button
          className={styles.publishButton}
          type="submit"
          aria-busy={isSubmitting}
          disabled={isSubmitting || !form.isFormComplete || !form.siteKey}
        >
          {isSubmitting ? 'Publishing…' : 'Publish'}
        </button>
      </form>
    </dialog>
  )
}

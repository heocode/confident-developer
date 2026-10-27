import { useState } from 'react'
import type { Ref } from 'react'

import { useReferences } from '../hooks/useReferences.ts'
import { useReferenceSubmission } from '../hooks/useReferenceSubmission.ts'
import {
  createReferenceSubmissionInput,
  validateReferenceTestimonial,
} from '../model/reference-submission-form.ts'
import type { ReferenceSubmissionDetails } from '../model/reference-submission-form.ts'
import styles from './HomeReferencesSection.module.css'
import submissionStyles from './ReferenceSubmission.module.css'
import { ReferenceComposer } from './ReferenceComposer.tsx'
import { ReferenceFeed } from './ReferenceFeed.tsx'
import { ReferenceRemovalModal } from './ReferenceRemovalModal.tsx'
import { ReferenceSubmissionModal } from './ReferenceSubmissionModal.tsx'

interface HomeReferencesSectionProps {
  sectionRef?: Ref<HTMLElement>
}

export function HomeReferencesSection({ sectionRef }: HomeReferencesSectionProps) {
  const { loadNextPage, retry, state: referencesState } = useReferences()
  const {
    clearSubmissionError,
    clearWithdrawError,
    restore,
    state: submissionState,
    submit,
    withdraw,
  } = useReferenceSubmission()
  const [composerError, setComposerError] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRemovalModalOpen, setIsRemovalModalOpen] = useState(false)
  const [isSubmissionNoticeVisible, setIsSubmissionNoticeVisible] = useState(false)
  const ownedReference =
    submissionState.status === 'owned' ||
    submissionState.status === 'withdrawing' ||
    submissionState.status === 'withdraw-error'
      ? submissionState.reference
      : undefined
  const isRestoringOwnership = submissionState.status === 'restoring'
  const isRemovingReference = submissionState.status === 'withdrawing'
  const isComposerDisabled =
    submissionState.status !== 'idle' && submissionState.status !== 'submission-error'

  function openSubmissionModal() {
    const error = validateReferenceTestimonial(draft)
    if (error) {
      setComposerError(error)
      return
    }

    setComposerError(null)
    clearSubmissionError()
    setIsModalOpen(true)
  }

  async function handleSubmission(
    details: ReferenceSubmissionDetails,
    turnstileToken: string,
  ) {
    const submitted = await submit(
      createReferenceSubmissionInput(draft, details, turnstileToken),
    )

    if (submitted) {
      setDraft('')
      setIsModalOpen(false)
      setIsSubmissionNoticeVisible(true)
    }

    return submitted
  }

  return (
    <section
      className={styles.section}
      id="home-references"
      aria-labelledby="home-references-title"
      ref={sectionRef}
    >
      <header className={styles.header}>
        <h2 id="home-references-title">WHAT PEOPLE SAY ABOUT THE STUFF</h2>
      </header>

      <div className={styles.panel}>
        <ReferenceFeed
          state={referencesState}
          isRestoringOwnership={isRestoringOwnership}
          ownedReference={ownedReference}
          isOwnedReferenceRemoving={isRemovingReference}
          onRetry={retry}
          onLoadNextPage={loadNextPage}
          onRequestOwnedReferenceRemoval={() => {
            clearWithdrawError()
            setIsRemovalModalOpen(true)
          }}
        />

        <div className={submissionStyles.submissionControls}>
          <ReferenceComposer
            canContinue={!validateReferenceTestimonial(draft)}
            disabled={isComposerDisabled}
            errorMessage={composerError}
            value={draft}
            onChange={(value) => {
              setDraft(value)
              if (composerError) setComposerError(null)
            }}
            onContinue={openSubmissionModal}
          />

          {submissionState.status === 'owned' && !submissionState.ownershipSaved && (
            <p className={submissionStyles.persistenceWarning} role="status">
              Your reference was submitted, but this browser could not save withdrawal access.
            </p>
          )}

          {submissionState.status === 'restore-error' && (
            <div className={submissionStyles.persistenceRecovery} role="alert">
              <span>{submissionState.message}</span>
              <button type="button" onClick={() => void restore()}>
                Try again
              </button>
            </div>
          )}
        </div>
      </div>

      <ReferenceSubmissionModal
        isOpen={isModalOpen}
        isSubmitting={submissionState.status === 'submitting'}
        submissionErrorMessage={
          submissionState.status === 'submission-error' ? submissionState.message : null
        }
        testimonial={draft}
        onClose={() => {
          clearSubmissionError()
          setIsModalOpen(false)
        }}
        onSubmit={handleSubmission}
      />

      <ReferenceRemovalModal
        errorMessage={
          submissionState.status === 'withdraw-error' ? submissionState.message : null
        }
        isOpen={isRemovalModalOpen && Boolean(ownedReference)}
        isRemoving={isRemovingReference}
        status={ownedReference?.status ?? null}
        onClose={() => {
          clearWithdrawError()
          setIsRemovalModalOpen(false)
        }}
        onConfirm={withdraw}
      />

      {isSubmissionNoticeVisible && (
        <div
          className={styles.submissionNotice}
          role="status"
          aria-live="polite"
          onAnimationEnd={() => setIsSubmissionNoticeVisible(false)}
        >
          <strong>Reference sent for review</strong>
          <span>We’ll publish it here once it’s approved.</span>
        </div>
      )}
    </section>
  )
}

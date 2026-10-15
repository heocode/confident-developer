import { useState } from 'react'

import { useHomeReferences } from '../hooks/useHomeReferences.ts'
import { useReferenceSubmission } from '../hooks/useReferenceSubmission.ts'
import {
  createReferenceSubmissionInput,
  validateReferenceTestimonial,
} from '../model/reference-submission-form.ts'
import type { ReferenceSubmissionDetails } from '../model/reference-submission-form.ts'
import styles from './HomeReferencesSection.module.css'
import submissionStyles from './ReferenceSubmission.module.css'
import { ReferenceComposer } from './ReferenceComposer.tsx'
import { ReferenceEmptyState } from './ReferenceEmptyState.tsx'
import { ReferenceList } from './ReferenceList.tsx'
import { ReferenceRemovalModal } from './ReferenceRemovalModal.tsx'
import { ReferenceSubmissionModal } from './ReferenceSubmissionModal.tsx'

const EMPTY_PAGINATION = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 0,
}

export function HomeReferencesSection() {
  const { loadNextPage, retry, state: referencesState } = useHomeReferences()
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
    }

    return submitted
  }

  const referenceFeed = ownedReference ? (
    <ReferenceList
      items={referencesState.status === 'ready' ? referencesState.items : []}
      pagination={
        referencesState.status === 'ready' ? referencesState.pagination : EMPTY_PAGINATION
      }
      isLoadingMore={referencesState.status === 'ready' && referencesState.isLoadingMore}
      loadMoreErrorMessage={
        referencesState.status === 'ready' ? referencesState.loadMoreErrorMessage : null
      }
      isOwnedReferenceRemoving={isRemovingReference}
      ownedReference={ownedReference}
      onLoadNextPage={loadNextPage}
      onRequestOwnedReferenceRemoval={() => {
        clearWithdrawError()
        setIsRemovalModalOpen(true)
      }}
    />
  ) : null

  return (
    <section
      className={styles.section}
      id="home-references"
      aria-labelledby="home-references-title"
    >
      <header className={styles.header}>
        <h2 id="home-references-title">WHAT PEOPLE SAY ABOUT THE STUFF</h2>
      </header>

      <div className={styles.panel}>
        {referenceFeed}

        {!referenceFeed && isRestoringOwnership && (
          <div className={styles.state} role="status" aria-live="polite">
            <p>Restoring your reference…</p>
          </div>
        )}

        {!referenceFeed && !isRestoringOwnership && referencesState.status === 'loading' && (
          <div className={styles.state} role="status" aria-live="polite">
            <p>Loading references…</p>
          </div>
        )}

        {!referenceFeed &&
          !isRestoringOwnership &&
          referencesState.status === 'empty' &&
          referencesState.emptyState && (
            <ReferenceEmptyState emptyState={referencesState.emptyState} />
          )}

        {!referenceFeed &&
          !isRestoringOwnership &&
          referencesState.status === 'empty' &&
          !referencesState.emptyState && (
            <div className={styles.state}>
              <h3>No references yet</h3>
            </div>
          )}

        {!referenceFeed && !isRestoringOwnership && referencesState.status === 'error' && (
          <div className={styles.state} role="alert">
            <h3>References are unavailable</h3>
            <p>{referencesState.message}</p>
            <button type="button" onClick={retry}>
              Try again
            </button>
          </div>
        )}

        {!referenceFeed && !isRestoringOwnership && referencesState.status === 'ready' && (
          <ReferenceList
            items={referencesState.items}
            pagination={referencesState.pagination}
            isLoadingMore={referencesState.isLoadingMore}
            loadMoreErrorMessage={referencesState.loadMoreErrorMessage}
            onLoadNextPage={loadNextPage}
          />
        )}

        <div className={submissionStyles.submissionControls}>
          <ReferenceComposer
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
    </section>
  )
}

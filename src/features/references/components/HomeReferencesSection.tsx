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
    clearError: clearSubmissionError,
    state: submissionState,
    submit,
  } = useReferenceSubmission()
  const [composerError, setComposerError] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const pendingReference =
    submissionState.status === 'success' ? submissionState.reference : undefined

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

  const referenceFeed = pendingReference ? (
    <ReferenceList
      items={referencesState.status === 'ready' ? referencesState.items : []}
      pagination={
        referencesState.status === 'ready' ? referencesState.pagination : EMPTY_PAGINATION
      }
      isLoadingMore={referencesState.status === 'ready' && referencesState.isLoadingMore}
      loadMoreErrorMessage={
        referencesState.status === 'ready' ? referencesState.loadMoreErrorMessage : null
      }
      ownedReference={pendingReference}
      onLoadNextPage={loadNextPage}
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

        {!referenceFeed && referencesState.status === 'loading' && (
          <div className={styles.state} role="status" aria-live="polite">
            <p>Loading references…</p>
          </div>
        )}

        {!referenceFeed && referencesState.status === 'empty' && referencesState.emptyState && (
          <ReferenceEmptyState emptyState={referencesState.emptyState} />
        )}

        {!referenceFeed && referencesState.status === 'empty' && !referencesState.emptyState && (
          <div className={styles.state}>
            <h3>No references yet</h3>
          </div>
        )}

        {!referenceFeed && referencesState.status === 'error' && (
          <div className={styles.state} role="alert">
            <h3>References are unavailable</h3>
            <p>{referencesState.message}</p>
            <button type="button" onClick={retry}>
              Try again
            </button>
          </div>
        )}

        {!referenceFeed && referencesState.status === 'ready' && (
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
            disabled={Boolean(pendingReference)}
            errorMessage={composerError}
            value={draft}
            onChange={(value) => {
              setDraft(value)
              if (composerError) setComposerError(null)
            }}
            onContinue={openSubmissionModal}
          />

          {submissionState.status === 'success' && !submissionState.ownershipSaved && (
            <p className={submissionStyles.persistenceWarning} role="status">
              Your reference was submitted, but this browser could not save withdrawal access.
            </p>
          )}
        </div>
      </div>

      <ReferenceSubmissionModal
        isOpen={isModalOpen}
        isSubmitting={submissionState.status === 'submitting'}
        submissionErrorMessage={
          submissionState.status === 'error' ? submissionState.message : null
        }
        testimonial={draft}
        onClose={() => {
          clearSubmissionError()
          setIsModalOpen(false)
        }}
        onSubmit={handleSubmission}
      />
    </section>
  )
}

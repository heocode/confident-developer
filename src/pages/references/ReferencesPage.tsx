import { useState } from 'react'

import { ReferenceFeed } from '../../features/references/components/ReferenceFeed.tsx'
import { ReferenceRemovalModal } from '../../features/references/components/ReferenceRemovalModal.tsx'
import { ReferenceSubmissionForm } from '../../features/references/components/ReferenceSubmissionForm.tsx'
import { useReferences } from '../../features/references/hooks/useReferences.ts'
import { useReferenceSubmission } from '../../features/references/hooks/useReferenceSubmission.ts'
import { createReferenceSubmissionInput } from '../../features/references/model/reference-submission-form.ts'
import type { ReferenceSubmissionDetails } from '../../features/references/model/reference-submission-form.ts'
import styles from './ReferencesPage.module.css'

export function ReferencesPage() {
  const { loadNextPage, retry, state: referencesState } = useReferences()
  const { clearWithdrawError, restore, state, submit, withdraw } = useReferenceSubmission()
  const [draft, setDraft] = useState('')
  const [isRemovalModalOpen, setIsRemovalModalOpen] = useState(false)
  const ownedReference =
    state.status === 'owned' || state.status === 'withdrawing' || state.status === 'withdraw-error'
      ? state.reference
      : undefined

  async function handleSubmission(details: ReferenceSubmissionDetails, turnstileToken: string) {
    const submitted = await submit(createReferenceSubmissionInput(draft, details, turnstileToken))
    if (submitted) setDraft('')
    return submitted
  }

  return (
    <section className={styles.page} aria-labelledby="references-page-title">
      <h1 id="references-page-title">WHAT PEOPLE SAY ABOUT THE STUFF</h1>
      <div className={styles.panel}>
        <div className={styles.feed} role="region" aria-label="Guestbook">
          <ReferenceFeed
            state={referencesState}
            isRestoringOwnership={state.status === 'restoring'}
            ownedReference={ownedReference}
            isOwnedReferenceRemoving={state.status === 'withdrawing'}
            onRetry={retry}
            onLoadNextPage={loadNextPage}
            onRequestOwnedReferenceRemoval={() => {
              clearWithdrawError()
              setIsRemovalModalOpen(true)
            }}
          />
        </div>
        <div className={styles.divider} aria-hidden="true" />
        <div className={styles.submission}>
          <ReferenceSubmissionForm
            state={state}
            testimonial={draft}
            onTestimonialChange={setDraft}
            onSubmit={handleSubmission}
            onRetryRestore={() => void restore()}
          />
        </div>
      </div>

      <ReferenceRemovalModal
        errorMessage={state.status === 'withdraw-error' ? state.message : null}
        isOpen={isRemovalModalOpen && Boolean(ownedReference)}
        isRemoving={state.status === 'withdrawing'}
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

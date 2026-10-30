import { useState } from 'react'

import { RouteSurfaceMotion } from '../../components/layout/route-transitions/route-surface/RouteSurfaceMotion.tsx'
import { usePrimaryRouteMotion } from '../../components/layout/route-transitions/usePrimaryRouteMotion.ts'
import { usePageScrollLock } from '../../components/layout/usePageScrollLock.ts'
import { useShortMobileViewport } from '../../components/layout/useShortMobileViewport.ts'
import { HorizontalSnapRail } from '../../components/scroll/HorizontalSnapRail.tsx'
import { ReferenceFeed } from '../../features/references/components/ReferenceFeed.tsx'
import { ReferenceRemovalModal } from '../../features/references/components/ReferenceRemovalModal.tsx'
import { ReferenceSubmissionForm } from '../../features/references/components/ReferenceSubmissionForm.tsx'
import { useReferences } from '../../features/references/hooks/useReferences.ts'
import { useReferenceSubmission } from '../../features/references/hooks/useReferenceSubmission.ts'
import { createReferenceSubmissionInput } from '../../features/references/model/reference-submission-form.ts'
import type { ReferenceSubmissionDetails } from '../../features/references/model/reference-submission-form.ts'
import styles from './ReferencesPage.module.css'

export function ReferencesPage() {
  const usesDocumentScroll = useShortMobileViewport()
  usePageScrollLock(!usesDocumentScroll, 'references-route')
  const routeMotion = usePrimaryRouteMotion('references')
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
    <section
      className={styles.page}
      aria-labelledby="references-page-title"
      data-route-motion-direction={routeMotion.direction ?? undefined}
      data-route-motion-phase={routeMotion.phase}
      data-references-document-scroll={usesDocumentScroll ? '' : undefined}
    >
      <h1 id="references-page-title">WHAT PEOPLE SAY ABOUT THE STUFF</h1>
      <div className={styles.content}>
        <RouteSurfaceMotion motion={routeMotion}>
          <HorizontalSnapRail
            className={styles.panel}
            aria-label="Guestbook and reference form"
            keyboardPageRatio={1}
          >
            <div className={styles.track}>
              <div className={styles.feed} role="region" aria-label="Guestbook">
                <ReferenceFeed
                  usesDocumentScroll={usesDocumentScroll}
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
              <div className={styles.submission} role="region" aria-label="Write a reference" tabIndex={0}>
                <ReferenceSubmissionForm
                  usesDocumentScroll={usesDocumentScroll}
                  state={state}
                  testimonial={draft}
                  onTestimonialChange={setDraft}
                  onSubmit={handleSubmission}
                  onRetryRestore={() => void restore()}
                />
              </div>
            </div>
          </HorizontalSnapRail>
        </RouteSurfaceMotion>
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

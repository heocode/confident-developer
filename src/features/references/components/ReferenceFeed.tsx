import type { ReferencesState } from '../hooks/useReferences.ts'
import type { OwnedReference } from '../model/reference.types.ts'
import { ReferenceEmptyState } from './ReferenceEmptyState.tsx'
import { ReferenceList } from './ReferenceList.tsx'
import styles from './ReferenceFeed.module.css'

const EMPTY_PAGINATION = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 0,
}

interface ReferenceFeedProps {
  state: ReferencesState
  isRestoringOwnership: boolean
  ownedReference?: OwnedReference
  isOwnedReferenceRemoving: boolean
  onRetry: () => void
  onLoadNextPage: () => void
  onRequestOwnedReferenceRemoval: () => void
}

export function ReferenceFeed({
  state,
  isRestoringOwnership,
  ownedReference,
  isOwnedReferenceRemoving,
  onRetry,
  onLoadNextPage,
  onRequestOwnedReferenceRemoval,
}: ReferenceFeedProps) {
  if (ownedReference || (!isRestoringOwnership && state.status === 'ready')) {
    return (
      <ReferenceList
        items={state.status === 'ready' ? state.items : []}
        pagination={state.status === 'ready' ? state.pagination : EMPTY_PAGINATION}
        isLoadingMore={state.status === 'ready' && state.isLoadingMore}
        loadMoreErrorMessage={state.status === 'ready' ? state.loadMoreErrorMessage : null}
        isOwnedReferenceRemoving={isOwnedReferenceRemoving}
        ownedReference={ownedReference}
        onLoadNextPage={onLoadNextPage}
        onRequestOwnedReferenceRemoval={onRequestOwnedReferenceRemoval}
      />
    )
  }

  if (isRestoringOwnership || state.status === 'loading') {
    return (
      <div className={styles.state} role="status" aria-live="polite">
        <p>{isRestoringOwnership ? 'Restoring your reference…' : 'Loading references…'}</p>
      </div>
    )
  }

  if (state.status === 'empty') {
    return state.emptyState ? (
      <ReferenceEmptyState emptyState={state.emptyState} />
    ) : (
      <div className={styles.state}>
        <h3>No references yet</h3>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className={styles.state} role="alert">
        <h3>References are unavailable</h3>
        <p>{state.message}</p>
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      </div>
    )
  }

  return null
}

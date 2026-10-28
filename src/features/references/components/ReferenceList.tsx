import { useEffect, useRef } from 'react'

import { hasNextReferencePage } from '../model/reference-list-state.ts'
import type {
  OwnedReference,
  PublicReference,
  ReferencePagination,
} from '../model/reference.types.ts'
import styles from './ReferenceFeed.module.css'
import { OwnedReferenceCard } from './OwnedReferenceCard.tsx'
import { ReferenceCard } from './ReferenceCard.tsx'

interface ReferenceListProps {
  items: PublicReference[]
  pagination: ReferencePagination
  isLoadingMore: boolean
  isOwnedReferenceRemoving?: boolean
  loadMoreErrorMessage: string | null
  ownedReference?: OwnedReference
  onLoadNextPage: () => void
  onRequestOwnedReferenceRemoval?: () => void
}

export function ReferenceList({
  items,
  pagination,
  isLoadingMore,
  isOwnedReferenceRemoving = false,
  loadMoreErrorMessage,
  ownedReference,
  onLoadNextPage,
  onRequestOwnedReferenceRemoval,
}: ReferenceListProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const hasNextPage = hasNextReferencePage(pagination)

  useEffect(() => {
    const root = viewportRef.current
    const sentinel = sentinelRef.current
    if (!root || !sentinel || !hasNextPage || isLoadingMore || loadMoreErrorMessage) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onLoadNextPage()
      },
      { root, rootMargin: '10rem 0px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isLoadingMore, loadMoreErrorMessage, onLoadNextPage])

  return (
    <div className={styles.viewport} ref={viewportRef} tabIndex={0} aria-label="References">
      <div className={styles.list}>
        {ownedReference && onRequestOwnedReferenceRemoval && (
          <OwnedReferenceCard
            disabled={isOwnedReferenceRemoving}
            reference={ownedReference}
            onRequestRemoval={onRequestOwnedReferenceRemoval}
          />
        )}
        {items.map((reference) => (
          <ReferenceCard reference={reference} key={reference.id} />
        ))}
      </div>

      <div className={styles.paginationStatus} aria-live="polite">
        {isLoadingMore && <p>Loading more references…</p>}
        {loadMoreErrorMessage && (
          <div role="alert">
            <p>{loadMoreErrorMessage}</p>
            <button type="button" onClick={onLoadNextPage}>
              Try again
            </button>
          </div>
        )}
      </div>

      {hasNextPage && !loadMoreErrorMessage && (
        <div className={styles.sentinel} ref={sentinelRef} aria-hidden="true" />
      )}
    </div>
  )
}

import type { ReferenceEmptyState as ReferenceEmptyStateData } from '../model/reference.types.ts'
import { formatReferenceDate } from '../presentation/reference-formatters.ts'
import styles from './ReferenceFeed.module.css'

interface ReferenceEmptyStateProps {
  emptyState: ReferenceEmptyStateData
}

export function ReferenceEmptyState({ emptyState }: ReferenceEmptyStateProps) {
  const updatedDate = formatReferenceDate(emptyState.updatedAt)

  return (
    <div className={styles.emptyViewport}>
      <article className={styles.emptyReferenceCard}>
        <div className={styles.emptyAvatarWrapper}>
          <img
            className={styles.avatar}
            src={emptyState.author.avatar.url}
            alt={emptyState.author.avatar.alt}
          />
          <span className={styles.presenceIndicator} aria-hidden="true" />
        </div>

        <div className={styles.referenceBody}>
          <header className={styles.referenceHeader}>
            <div className={styles.authorLine}>
              <h3>{emptyState.author.displayName}</h3>
              <p>@{emptyState.author.handle}</p>
            </div>

            {updatedDate && <time dateTime={emptyState.updatedAt}>{updatedDate}</time>}
          </header>

          <p className={styles.testimonial}>{emptyState.message}</p>
        </div>
      </article>
    </div>
  )
}

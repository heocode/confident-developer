import referenceAvatarUrl from '../../../assets/icons/references/reference-avatar.svg'
import infoIconUrl from '../../../assets/icons/references/info.svg'
import type { OwnedReference } from '../model/reference.types.ts'
import { formatReferenceDate } from '../presentation/reference-formatters.ts'
import styles from './ReferenceFeed.module.css'
import { ReferenceRating } from './ReferenceRating.tsx'

interface OwnedReferenceCardProps {
  disabled: boolean
  reference: OwnedReference
  onRequestRemoval: () => void
}

export function OwnedReferenceCard({
  disabled,
  reference,
  onRequestRemoval,
}: OwnedReferenceCardProps) {
  const submittedDate = formatReferenceDate(reference.submittedAt)
  const isRejected = reference.status === 'rejected'

  return (
    <article className={styles.referenceCard}>
      <img className={styles.avatar} src={referenceAvatarUrl} alt="" />

      <div className={styles.referenceBody}>
        <header className={styles.referenceHeader}>
          <div className={`${styles.authorLine} ${styles.referenceAuthorLine}`}>
            <h3>{reference.name}</h3>
            <div className={styles.authorMeta}>
              <span>{reference.company}</span>
              <span className={styles.metaItem}>{reference.position}</span>
              <span className={styles.statusGroup}>
                {isRejected ? (
                  <span className={styles.rejectedStatus}>Rejected</span>
                ) : (
                  <span className={styles.pendingStatus}>Pending review</span>
                )}

                {isRejected ? (
                  <button
                    className={styles.rejectedAction}
                    type="button"
                    disabled={disabled}
                    onClick={onRequestRemoval}
                  >
                    Delete
                  </button>
                ) : (
                  <span className={styles.ownershipControl}>
                    <button
                      className={styles.ownershipInfo}
                      type="button"
                      aria-label="Reference submission status and actions"
                    >
                      <img src={infoIconUrl} alt="" />
                    </button>
                    <span className={styles.ownershipPopover} role="status">
                      <span className={styles.ownershipPopoverSurface}>
                        <span>
                          Your reference was submitted <strong>successfully</strong>. It won’t
                          be visible publicly until it’s approved.
                        </span>
                        <button type="button" disabled={disabled} onClick={onRequestRemoval}>
                          Withdraw
                        </button>
                      </span>
                    </span>
                  </span>
                )}
              </span>
            </div>
          </div>

          {submittedDate && <time dateTime={reference.submittedAt}>{submittedDate}</time>}
        </header>

        <p className={styles.testimonial}>{reference.testimonial}</p>

        <div className={styles.ratings}>
          <ReferenceRating label="Overall experience" value={reference.ratings.overall} />
          <ReferenceRating label="Technical skills" value={reference.ratings.technical} />
          <ReferenceRating label="Communication" value={reference.ratings.communication} />
        </div>
      </div>
    </article>
  )
}

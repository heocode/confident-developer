import referenceAvatarUrl from '../../../assets/icons/references/reference-avatar.svg'
import type { OwnedReference } from '../model/reference.types.ts'
import { formatReferenceDate } from '../presentation/reference-formatters.ts'
import styles from './HomeReferencesSection.module.css'
import { ReferenceRating } from './ReferenceRating.tsx'

interface OwnedReferenceCardProps {
  reference: OwnedReference
}

export function OwnedReferenceCard({ reference }: OwnedReferenceCardProps) {
  const submittedDate = formatReferenceDate(reference.submittedAt)

  return (
    <article className={styles.referenceCard}>
      <img className={styles.avatar} src={referenceAvatarUrl} alt="" />

      <div className={styles.referenceBody}>
        <header className={styles.referenceHeader}>
          <div className={styles.authorLine}>
            <h3>{reference.name}</h3>
            <p>
              {reference.company} · {reference.position} · Pending review
            </p>
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

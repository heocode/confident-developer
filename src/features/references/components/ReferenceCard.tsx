import referenceAvatarUrl from '../../../assets/icons/references/reference-avatar.svg'
import type { PublicReference } from '../model/reference.types.ts'
import { formatReferenceDate } from '../presentation/reference-formatters.ts'
import styles from './ReferenceFeed.module.css'
import { ReferenceRating } from './ReferenceRating.tsx'

interface ReferenceCardProps {
  reference: PublicReference
}

export function ReferenceCard({ reference }: ReferenceCardProps) {
  const publishedDate = formatReferenceDate(reference.publishedAt)

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
            </div>
          </div>

          {publishedDate && <time dateTime={reference.publishedAt}>{publishedDate}</time>}
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

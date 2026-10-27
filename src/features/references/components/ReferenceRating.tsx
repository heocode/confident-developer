import starUrl from '../../../assets/icons/references/star.svg'
import styles from './ReferenceFeed.module.css'

interface ReferenceRatingProps {
  label: string
  value: number
}

const ratingValues = [1, 2, 3, 4, 5]

export function ReferenceRating({ label, value }: ReferenceRatingProps) {
  return (
    <div className={styles.rating} aria-label={`${label}: ${value} out of 5`}>
      <span className={styles.ratingLabel}>{label}</span>
      <span className={styles.stars} aria-hidden="true">
        {ratingValues.map((ratingValue) => (
          <span
            className={ratingValue <= value ? styles.starActive : styles.starInactive}
            key={ratingValue}
            style={{
              WebkitMaskImage: `url("${starUrl}")`,
              maskImage: `url("${starUrl}")`,
            }}
          />
        ))}
      </span>
    </div>
  )
}

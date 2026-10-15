import { useState } from 'react'

import starIconUrl from '../../../assets/icons/references/star.svg'
import styles from './ReferenceSubmission.module.css'

interface ReferenceRatingInputProps {
  errorMessage?: string
  label: string
  name: string
  value: number
  onChange: (value: number) => void
}

export function ReferenceRatingInput({
  errorMessage,
  label,
  name,
  value,
  onChange,
}: ReferenceRatingInputProps) {
  const errorId = `${name}-rating-error`
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const previewRating = hoveredRating ?? value

  return (
    <fieldset className={styles.ratingField} aria-describedby={errorMessage ? errorId : undefined}>
      <legend>{label}</legend>

      <div className={styles.ratingChoices} onMouseLeave={() => setHoveredRating(null)}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <label
            className={styles.ratingChoice}
            key={rating}
            onMouseEnter={() => setHoveredRating(rating)}
          >
            <input
              type="radio"
              name={name}
              value={rating}
              checked={value === rating}
              onChange={() => onChange(rating)}
            />
            <img
              className={
                rating <= previewRating ? styles.ratingStarSelected : styles.ratingStar
              }
              src={starIconUrl}
              alt=""
            />
            <span className={styles.visuallyHidden}>{rating} out of 5</span>
          </label>
        ))}
      </div>

      {errorMessage && (
        <p className={styles.fieldError} id={errorId}>
          {errorMessage}
        </p>
      )}
    </fieldset>
  )
}

import cloudUrl from '../../assets/images/backgrounds/cloud.svg'
import styles from './CloudBackground.module.css'

const cloudPlacements = [
  { className: styles.cloudOne, id: 'upper-left' },
  { className: styles.cloudTwo, id: 'middle-right' },
  { className: styles.cloudThree, id: 'lower-left' },
  { className: styles.cloudFour, id: 'upper-right' },
  { className: styles.cloudFive, id: 'lower-right' },
]

export function CloudBackground() {
  return (
    <div className={styles.background} aria-hidden="true">
      {cloudPlacements.map(({ className, id }) => (
        <img className={`${styles.cloud} ${className}`} key={id} src={cloudUrl} alt="" />
      ))}
    </div>
  )
}

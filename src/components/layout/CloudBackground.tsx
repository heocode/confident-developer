import primaryCloudUrl from '../../assets/images/backgrounds/cloud-primary.svg'
import secondaryCloudUrl from '../../assets/images/backgrounds/cloud-secondary.svg'
import styles from './CloudBackground.module.css'

const cloudPlacements = [
  { className: styles.cloudOne, id: 'upper-left', src: primaryCloudUrl },
  { className: styles.cloudTwo, id: 'middle-right', src: secondaryCloudUrl },
  { className: styles.cloudThree, id: 'lower-left', src: primaryCloudUrl },
  { className: styles.cloudFour, id: 'upper-right', src: secondaryCloudUrl },
  { className: styles.cloudFive, id: 'lower-right', src: primaryCloudUrl },
]

export function CloudBackground() {
  return (
    <div className={styles.background} aria-hidden="true">
      <div className={styles.gustLayer}>
        <div className={styles.entranceLayer}>
          {cloudPlacements.map(({ className, id, src }) => (
            <img
              className={`${styles.cloud} ${className}`}
              key={id}
              src={src}
              alt=""
            />
          ))}
        </div>
      </div>
    </div>
  )
}

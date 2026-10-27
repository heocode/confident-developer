import type { Ref } from 'react'

import styles from './HomeProfileSection.module.css'
import { ProfileOverview } from './ProfileOverview.tsx'
import type { ProfileOverviewProps } from './ProfileOverview.tsx'

interface HomeProfileCardProps extends ProfileOverviewProps {
  cardRef: Ref<HTMLDivElement>
}

export function HomeProfileCard({
  cardRef,
  ...profileOverviewProps
}: HomeProfileCardProps) {
  return (
    <div className={styles.card} ref={cardRef}>
      <ProfileOverview {...profileOverviewProps} />
    </div>
  )
}

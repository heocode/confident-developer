import type { Ref } from 'react'

import { useHomeProfile } from '../hooks/useHomeProfile.ts'
import { useProfileViewTracking } from '../hooks/useProfileViewTracking.ts'
import styles from './HomeProfileSection.module.css'
import { ProfileCard } from './ProfileCard.tsx'

interface HomeProfileSectionProps {
  sectionRef?: Ref<HTMLElement>
}

export function HomeProfileSection({ sectionRef }: HomeProfileSectionProps) {
  const { recordView, retry, state, toggleLike } = useHomeProfile()
  const cardRef = useProfileViewTracking(state.status === 'ready', recordView)

  return (
    <section
      className={styles.section}
      id="home-profile"
      aria-labelledby="home-profile-title"
      ref={sectionRef}
    >
      <header className={styles.header}>
        <h2 id="home-profile-title">WHO BUILDS THE STUFF</h2>
      </header>

      <div className={styles.content}>
        {state.status === 'loading' && (
          <div className={`${styles.card} ${styles.state}`} role="status" aria-live="polite">
            <p>Loading profile…</p>
          </div>
        )}

        {state.status === 'error' && (
          <div className={`${styles.card} ${styles.state}`} role="alert">
            <h3>Profile unavailable</h3>
            <p>{state.message}</p>
            <button type="button" onClick={retry}>
              Try again
            </button>
          </div>
        )}

        {state.status === 'ready' && (
          <ProfileCard
            cardRef={cardRef}
            githubSummary={state.githubSummary}
            githubErrorMessage={state.githubErrorMessage}
            post={state.post}
            liked={state.liked}
            interactionReady={state.interactionStatus === 'ready'}
            interactionErrorMessage={state.interactionErrorMessage}
            isLikePending={state.isLikePending}
            likeErrorMessage={state.likeErrorMessage}
            onToggleLike={toggleLike}
          />
        )}
      </div>
    </section>
  )
}

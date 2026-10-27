import { ProfileOverview } from '../../features/profile/components/ProfileOverview.tsx'
import { useProfile } from '../../features/profile/hooks/useProfile.ts'
import { useProfileViewTracking } from '../../features/profile/hooks/useProfileViewTracking.ts'
import styles from './AboutPage.module.css'
import { AboutDetails } from './components/AboutDetails.tsx'

export function AboutPage() {
  const { recordView, retry, state, toggleLike } = useProfile()
  const profileRef = useProfileViewTracking(state.status === 'ready', recordView)

  return (
    <section className={styles.page} aria-labelledby="about-page-title">
      <h1 id="about-page-title">WHO BUILDS THE STUFF?</h1>

      <div className={styles.panel}>
        <div className={styles.profile} ref={profileRef}>
          {state.status === 'loading' && (
            <div className={styles.profileState} role="status">
              <p>Loading profile…</p>
            </div>
          )}

          {state.status === 'error' && (
            <div className={styles.profileState} role="alert">
              <p>{state.message}</p>
              <button type="button" onClick={retry}>
                Try again
              </button>
            </div>
          )}

          {state.status === 'ready' && (
            <ProfileOverview
              githubSummary={state.githubSummary}
              githubErrorMessage={state.githubErrorMessage}
              interactionErrorMessage={state.interactionErrorMessage}
              interactionReady={state.interactionStatus === 'ready'}
              isLikePending={state.isLikePending}
              likeErrorMessage={state.likeErrorMessage}
              liked={state.liked}
              onToggleLike={toggleLike}
              post={state.post}
            />
          )}
        </div>

        <div className={styles.divider} aria-hidden="true" />
        <AboutDetails />
      </div>
    </section>
  )
}

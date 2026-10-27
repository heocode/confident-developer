import unicardUrl from '../../../assets/icons/profile/unicard.svg'
import avatarUrl from '../../../assets/images/profile/avatar.webp'
import { siteIdentity } from '../../../data/site.ts'
import { PROFILE_RESUME_DOWNLOAD_PATH } from '../api/profile-api.ts'
import type {
  GitHubSummary,
  ProfilePost as ProfilePostData,
} from '../model/profile.types.ts'
import styles from './ProfileOverview.module.css'
import { ProfilePost } from './ProfilePost.tsx'

export interface ProfileOverviewProps {
  className?: string
  githubErrorMessage: string | null
  githubSummary: GitHubSummary | null
  interactionErrorMessage: string | null
  interactionReady: boolean
  isLikePending: boolean
  likeErrorMessage: string | null
  liked: boolean
  onToggleLike: () => void
  post: ProfilePostData
}

export function ProfileOverview({
  className,
  githubErrorMessage,
  githubSummary,
  interactionErrorMessage,
  interactionReady,
  isLikePending,
  likeErrorMessage,
  liked,
  onToggleLike,
  post,
}: ProfileOverviewProps) {
  const displayName = `${siteIdentity.firstName} ${siteIdentity.lastName}`

  return (
    <div className={[styles.overview, className].filter(Boolean).join(' ')}>
      <a
        aria-label="Download Vadim Iskakov’s resume"
        className={styles.resumeLink}
        href={PROFILE_RESUME_DOWNLOAD_PATH}
      >
        <img alt="" src={unicardUrl} />
      </a>

      <div className={styles.identity}>
        <div className={styles.avatar}>
          <img
            alt={siteIdentity.profile.avatarAlt}
            height="180"
            src={avatarUrl}
            width="180"
          />
          <span aria-label="Available" className={styles.presence} role="img" />
        </div>

        <h3>{displayName}</h3>
        <p className={styles.role}>{siteIdentity.profile.role}</p>

        <dl
          aria-label="GitHub statistics"
          className={styles.statistics}
          title={githubErrorMessage ?? undefined}
        >
          <div>
            <dt>repositories</dt>
            <dd>{githubSummary?.repositoryCount ?? '—'}</dd>
          </div>
          <div>
            <dt>languages</dt>
            <dd>{githubSummary?.languageCount ?? '—'}</dd>
          </div>
        </dl>

        {githubErrorMessage && (
          <p className={styles.githubMessage} role="status">
            {githubErrorMessage}
          </p>
        )}
      </div>

      <div className={styles.divider} />

      <ProfilePost
        interactionErrorMessage={interactionErrorMessage}
        interactionReady={interactionReady}
        isLikePending={isLikePending}
        likeErrorMessage={likeErrorMessage}
        liked={liked}
        onToggleLike={onToggleLike}
        post={post}
      />
    </div>
  )
}

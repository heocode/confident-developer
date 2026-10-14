import type { Ref } from 'react'

import unicardUrl from '../../../assets/icons/profile/unicard.svg'
import avatarUrl from '../../../assets/images/profile/avatar.webp'
import { siteIdentity } from '../../../data/site.ts'
import { PROFILE_RESUME_DOWNLOAD_PATH } from '../api/profile-api.ts'
import type { GitHubSummary, ProfilePost as ProfilePostData } from '../model/profile.types.ts'
import styles from './HomeProfileSection.module.css'
import { ProfilePost } from './ProfilePost.tsx'

interface ProfileCardProps {
  cardRef: Ref<HTMLDivElement>
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

export function ProfileCard({
  cardRef,
  githubErrorMessage,
  githubSummary,
  interactionErrorMessage,
  interactionReady,
  isLikePending,
  likeErrorMessage,
  liked,
  onToggleLike,
  post,
}: ProfileCardProps) {
  const displayName = `${siteIdentity.firstName} ${siteIdentity.lastName}`

  return (
    <div className={styles.card} ref={cardRef}>
      <a
        className={styles.resumeLink}
        href={PROFILE_RESUME_DOWNLOAD_PATH}
        aria-label="Download Vadim Iskakov’s resume"
      >
        <img src={unicardUrl} alt="" />
      </a>

      <div className={styles.identity}>
        <div className={styles.avatar}>
          <img src={avatarUrl} alt={siteIdentity.profile.avatarAlt} width="180" height="180" />
          <span className={styles.presence} role="img" aria-label="Available" />
        </div>

        <h3>{displayName}</h3>
        <p className={styles.role}>{siteIdentity.profile.role}</p>

        <dl
          className={styles.statistics}
          aria-label="GitHub statistics"
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
        post={post}
        liked={liked}
        interactionReady={interactionReady}
        isLikePending={isLikePending}
        interactionErrorMessage={interactionErrorMessage}
        likeErrorMessage={likeErrorMessage}
        onToggleLike={onToggleLike}
      />
    </div>
  )
}

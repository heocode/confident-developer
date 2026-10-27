import eyeUrl from '../../../assets/icons/profile/eye.svg'
import likeActiveUrl from '../../../assets/icons/profile/like-active.svg'
import likeUrl from '../../../assets/icons/profile/like.svg'
import avatarUrl from '../../../assets/images/profile/avatar.webp'
import { siteIdentity } from '../../../data/site.ts'
import type { ProfilePost as ProfilePostData } from '../model/profile.types.ts'
import { formatProfilePostDate } from '../presentation/profile-formatters.ts'
import styles from './ProfilePost.module.css'

export interface ProfilePostProps {
  interactionErrorMessage: string | null
  interactionReady: boolean
  isLikePending: boolean
  likeErrorMessage: string | null
  liked: boolean
  onToggleLike: () => void
  post: ProfilePostData
}

export function ProfilePost({
  interactionErrorMessage,
  interactionReady,
  isLikePending,
  likeErrorMessage,
  liked,
  onToggleLike,
  post,
}: ProfilePostProps) {
  const postDate = formatProfilePostDate(post.contentUpdatedAt, siteIdentity.timezone)
  const interactionMessage = likeErrorMessage ?? interactionErrorMessage

  return (
    <article
      className={styles.post}
      aria-label="Latest profile post"
      title={interactionMessage ?? undefined}
    >
      <div className={styles.postAvatar} aria-hidden="true">
        <img src={avatarUrl} alt="" width="67" height="67" />
        <span className={styles.postPresence} />
      </div>

      <div className={styles.postContent}>
        <header className={styles.postHeader}>
          <div className={styles.postAuthor}>
            <strong>{`${siteIdentity.firstName} ${siteIdentity.lastName}`}</strong>
            <span>{siteIdentity.profile.handle}</span>
          </div>
          {postDate && <time dateTime={post.contentUpdatedAt}>{postDate}</time>}
        </header>

        <p className={styles.postText}>{post.text}</p>

        <div className={styles.postActions}>
          <button
            className={styles.likeButton}
            type="button"
            aria-label={liked ? 'Remove like from profile post' : 'Like profile post'}
            aria-pressed={liked}
            disabled={!interactionReady || isLikePending}
            onClick={onToggleLike}
          >
            <img src={liked ? likeActiveUrl : likeUrl} alt="" />
            <span>{post.likes}</span>
          </button>

          <span className={styles.views} aria-label={`${post.views} views`}>
            <span>{post.views}</span>
            <img src={eyeUrl} alt="" />
          </span>
        </div>
      </div>

      {interactionMessage && (
        <p className={styles.interactionMessage} role="status">
          {interactionMessage}
        </p>
      )}
    </article>
  )
}

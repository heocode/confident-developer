import { ApiError } from '../../../api/api-error.ts'
import type { ProfilePostInteraction } from './profile.types.ts'

export interface ProfilePostEngagement {
  liked: boolean
  likes: number
}

export function getOptimisticProfilePostEngagement(
  engagement: ProfilePostEngagement,
): ProfilePostEngagement {
  return engagement.liked
    ? { liked: false, likes: Math.max(0, engagement.likes - 1) }
    : { liked: true, likes: engagement.likes + 1 }
}

export function getConfirmedProfilePostEngagement(
  interaction: ProfilePostInteraction,
): ProfilePostEngagement {
  return {
    liked: interaction.liked,
    likes: interaction.likes,
  }
}

export function isStaleProfilePostRevision(error: unknown) {
  return error instanceof ApiError && error.kind === 'http' && error.status === 409
}

export function getProfileRequestErrorMessage(error: unknown, resource: 'profile' | 'github') {
  const fallback =
    resource === 'github'
      ? 'GitHub statistics are unavailable right now.'
      : 'The profile could not be loaded. Please try again.'

  if (!(error instanceof ApiError)) return fallback

  if (error.kind === 'network') {
    return resource === 'github'
      ? 'GitHub statistics are unavailable right now.'
      : 'The profile service is unavailable right now. Please try again.'
  }

  if (error.kind === 'invalid-response') {
    return resource === 'github'
      ? 'GitHub statistics returned an unexpected response.'
      : 'The Profile API returned an unexpected response. Please try again.'
  }

  return error.message
}

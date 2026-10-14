import { getApiData, sendApiData } from '../../../api/http-client.ts'
import type { ApiRequestOptions } from '../../../api/http-client.ts'
import type {
  ProfilePost,
  ProfilePostInteraction,
  ProfilePostRevisionInput,
  ProfilePostView,
} from '../model/profile.types.ts'

const PROFILE_POST_PATH = '/api/v1/profile-post'

function toRevisionInput(revision: number): ProfilePostRevisionInput {
  if (!Number.isSafeInteger(revision) || revision <= 0) {
    throw new TypeError('Profile post revision must be a positive integer.')
  }

  return { revision }
}

export function getProfilePost(options?: ApiRequestOptions) {
  return getApiData<ProfilePost>(PROFILE_POST_PATH, options)
}

export function getProfilePostInteraction(revision: number, options?: ApiRequestOptions) {
  const input = toRevisionInput(revision)

  return getApiData<ProfilePostInteraction>(
    `${PROFILE_POST_PATH}/interaction?revision=${input.revision}`,
    options,
  )
}

export function likeProfilePost(revision: number, options?: ApiRequestOptions) {
  return sendApiData<ProfilePostInteraction, ProfilePostRevisionInput>(`${PROFILE_POST_PATH}/like`, {
    method: 'PUT',
    body: toRevisionInput(revision),
    signal: options?.signal,
  })
}

export function unlikeProfilePost(revision: number, options?: ApiRequestOptions) {
  return sendApiData<ProfilePostInteraction, ProfilePostRevisionInput>(`${PROFILE_POST_PATH}/like`, {
    method: 'DELETE',
    body: toRevisionInput(revision),
    signal: options?.signal,
  })
}

export function recordProfilePostView(revision: number, options?: ApiRequestOptions) {
  return sendApiData<ProfilePostView, ProfilePostRevisionInput>(`${PROFILE_POST_PATH}/view`, {
    method: 'POST',
    body: toRevisionInput(revision),
    signal: options?.signal,
  })
}

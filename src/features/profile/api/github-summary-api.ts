import { getApiData } from '../../../api/http-client.ts'
import type { ApiRequestOptions } from '../../../api/http-client.ts'
import type { GitHubSummary } from '../model/profile.types.ts'

const GITHUB_SUMMARY_PATH = '/api/v1/github-summary'

export function getGitHubSummary(options?: ApiRequestOptions) {
  return getApiData<GitHubSummary>(GITHUB_SUMMARY_PATH, options)
}

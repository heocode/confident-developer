import { getApiData } from '../../../api/http-client.ts'
import type { ApiRequestOptions } from '../../../api/http-client.ts'
import type { PublicProject, PublicProjectDetail } from '../model/project.types.ts'

const PROJECTS_PATH = '/api/v1/projects'

export function getProjects(options?: ApiRequestOptions) {
  return getApiData<PublicProject[]>(PROJECTS_PATH, options)
}

export function getHomeProjects(options?: ApiRequestOptions) {
  return getApiData<PublicProject[]>(`${PROJECTS_PATH}?placement=home`, options)
}

export function getProjectBySlug(slug: string, options?: ApiRequestOptions) {
  if (!slug.trim()) throw new TypeError('Project slug is required.')

  return getApiData<PublicProjectDetail>(`${PROJECTS_PATH}/${encodeURIComponent(slug)}`, options)
}

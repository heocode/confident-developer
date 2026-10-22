import { getApiData } from '../../../api/http-client.ts'
import type { ApiRequestOptions } from '../../../api/http-client.ts'
import type { ServiceDetail, ServiceSummary } from '../model/service.types.ts'

const SERVICES_PATH = '/api/v1/services'

export function getServices(options?: ApiRequestOptions) {
  return getApiData<ServiceSummary[]>(SERVICES_PATH, options)
}

export function getHomeServices(options?: ApiRequestOptions) {
  return getApiData<ServiceSummary[]>(`${SERVICES_PATH}?placement=home`, options)
}

export function getServiceBySlug(slug: string, options?: ApiRequestOptions) {
  if (!slug.trim()) throw new TypeError('Service slug is required.')

  return getApiData<ServiceDetail>(`${SERVICES_PATH}/${encodeURIComponent(slug)}`, options)
}

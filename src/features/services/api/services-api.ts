import { getApiData } from '../../../api/http-client.ts'
import type { ApiRequestOptions } from '../../../api/http-client.ts'
import type { PublicService } from '../model/service.types.ts'

const SERVICES_PATH = '/api/v1/services'

export function getServices(options?: ApiRequestOptions) {
  return getApiData<PublicService[]>(SERVICES_PATH, options)
}

export function getHomeServices(options?: ApiRequestOptions) {
  return getApiData<PublicService[]>(`${SERVICES_PATH}?placement=home`, options)
}

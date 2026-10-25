import { useOutletContext } from 'react-router-dom'

import type { ServiceDetailCache } from '../hooks/useServicesPageData.ts'
import type { ServicesListState } from '../presentation/services-page-state.ts'
import type { ServiceOpeningRequest } from './service-route-motion.ts'

export interface ServicesRouteContextValue {
  beginServiceOpening: (request: ServiceOpeningRequest) => boolean
  detailCache: ServiceDetailCache
  reportServiceDetailResolution: (slug: string) => void
  servicesState: ServicesListState
  retryServices: () => void
}

export function useServicesRouteContext() {
  return useOutletContext<ServicesRouteContextValue>()
}

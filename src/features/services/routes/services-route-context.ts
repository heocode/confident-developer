import { useOutletContext } from 'react-router-dom'

import type { ServiceDetailCache } from '../hooks/useServicesPageData.ts'
import type { ServicesListState } from '../presentation/services-page-state.ts'
import type { ServiceSummaryPresentation } from '../presentation/services-page.ts'
import type { ServiceOpeningRequest } from './service-route-motion.ts'

export interface ServicesRouteContextValue {
  beginServiceClosing: (service: ServiceSummaryPresentation) => boolean
  beginServiceOpening: (request: ServiceOpeningRequest) => boolean
  closingServiceSlug: string | null
  detailCache: ServiceDetailCache
  reportServiceClosingTarget: (request: ServiceOpeningRequest) => void
  reportServiceDetailResolution: (slug: string) => void
  servicesState: ServicesListState
  retryServices: () => void
}

export function useServicesRouteContext() {
  return useOutletContext<ServicesRouteContextValue>()
}

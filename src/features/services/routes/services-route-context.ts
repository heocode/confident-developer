import { useOutletContext } from 'react-router-dom'

import type { ServiceDetailCache } from '../hooks/useServicesPageData.ts'
import type { ServicesListState } from '../presentation/services-page-state.ts'

export interface ServicesRouteContextValue {
  detailCache: ServiceDetailCache
  servicesState: ServicesListState
  retryServices: () => void
}

export function useServicesRouteContext() {
  return useOutletContext<ServicesRouteContextValue>()
}

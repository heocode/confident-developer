import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { useServicesList } from '../hooks/useServicesPageData.ts'
import type { ServiceDetailCache } from '../hooks/useServicesPageData.ts'
import type { ServicesRouteContextValue } from './services-route-context.ts'

export function ServicesRoute() {
  const { retry, state } = useServicesList()
  const [detailCache] = useState<ServiceDetailCache>(() => new Map())

  return (
    <section className="route-page" aria-labelledby="services-title">
      <h1 id="services-title">HOW I BUILD STUFF</h1>
      <Outlet
        context={{
          detailCache,
          servicesState: state,
          retryServices: retry,
        } satisfies ServicesRouteContextValue}
      />
    </section>
  )
}

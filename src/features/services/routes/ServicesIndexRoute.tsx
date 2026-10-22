import { ServicesIndexView } from '../components/ServicesIndexView.tsx'
import { ServicesPageFeedback } from '../components/ServicesPageFeedback.tsx'
import { resolveServicesIndexState } from '../presentation/services-page-state.ts'
import { useServicesRouteContext } from './services-route-context.ts'

export function ServicesIndexRoute() {
  const { retryServices, servicesState } = useServicesRouteContext()
  const state = resolveServicesIndexState(servicesState)

  if (state.status === 'loading') {
    return <ServicesPageFeedback title="Loading services" message="Preparing the Services archive…" />
  }

  if (state.status === 'error') {
    return (
      <ServicesPageFeedback
        isError
        title="Services unavailable"
        message={state.message}
        onRetry={retryServices}
      />
    )
  }

  if (state.status === 'empty') {
    return (
      <ServicesPageFeedback
        title="No published Services"
        message="The Services archive is being prepared. Please check back soon."
      />
    )
  }

  return <ServicesIndexView services={state.services} />
}

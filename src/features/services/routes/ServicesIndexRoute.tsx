import { ServicesIndexView } from '../components/ServicesIndexView.tsx'
import { ServicesPageFeedback } from '../components/ServicesPageFeedback.tsx'
import { servicePresentationAssets } from '../presentation/service-presentation-assets.ts'
import { resolveServicesIndexState } from '../presentation/services-page-state.ts'
import { useServicesRouteContext } from './services-route-context.ts'

export function ServicesIndexRoute() {
  const { retryServices, servicesState } = useServicesRouteContext()
  const state = resolveServicesIndexState(servicesState, servicePresentationAssets)

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

  if (state.status === 'configuration-error') {
    return (
      <ServicesPageFeedback
        isError
        title="Services unavailable"
        message={`“${state.issue.serviceSlug}” has incomplete published content.`}
      />
    )
  }

  return <ServicesIndexView services={state.presentation.services} />
}

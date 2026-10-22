import { useParams } from 'react-router-dom'

import { ServiceDetailView } from '../components/ServiceDetailView.tsx'
import { ServicesPageFeedback } from '../components/ServicesPageFeedback.tsx'
import { useServiceDetail } from '../hooks/useServicesPageData.ts'
import { resolveServiceRouteState } from '../presentation/services-page-state.ts'
import { useServicesRouteContext } from './services-route-context.ts'

export function ServiceDetailRoute() {
  const { slug } = useParams()

  if (!slug) {
    return (
      <ServicesPageFeedback
        isError
        title="Service not found"
        message="The requested Service URL is invalid."
      />
    )
  }

  return <ServiceDetailContent slug={slug} />
}

function ServiceDetailContent({ slug }: { slug: string }) {
  const { detailCache, retryServices, servicesState } = useServicesRouteContext()
  const { retry: retryDetail, state: detailState } = useServiceDetail(slug, detailCache)
  const state = resolveServiceRouteState(slug, servicesState, detailState)

  switch (state.status) {
    case 'services-loading':
      return <ServicesPageFeedback title="Loading services" message="Preparing the Services archive…" />
    case 'services-error':
      return (
        <ServicesPageFeedback
          isError
          title="Services unavailable"
          message={state.message}
          onRetry={retryServices}
        />
      )
    case 'empty':
      return (
        <ServicesPageFeedback
          title="No published Services"
          message="The Services archive is being prepared. Please check back soon."
        />
      )
    case 'not-found':
      return (
        <ServicesPageFeedback
          isError
          title="Service not found"
          message={`“${state.slug}” is not available in the published Services archive.`}
        />
      )
    case 'detail-loading':
      return <ServicesPageFeedback title="Loading Service" message="Preparing Service details…" />
    case 'detail-error':
      return (
        <ServicesPageFeedback
          isError
          title="Service unavailable"
          message={state.message}
          onRetry={retryDetail}
        />
      )
    case 'ready':
      return <ServiceDetailView service={state.service} />
  }
}

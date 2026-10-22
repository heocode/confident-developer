import { ApiError } from '../../../api/api-error.ts'
import type { ServiceDetail, ServiceSummary } from '../model/service.types.ts'

export type ServicesListState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; services: ServiceSummary[] }

export type ServiceDetailState =
  | { status: 'loading' }
  | { status: 'error'; message: string; notFound: boolean }
  | { status: 'ready'; service: ServiceDetail }

export type ServicesIndexState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'ready'; services: ServiceSummary[] }

export type ServiceRouteState =
  | { status: 'services-loading' }
  | { status: 'services-error'; message: string }
  | { status: 'empty' }
  | { status: 'not-found'; services: ServiceSummary[]; slug: string }
  | { status: 'detail-loading'; services: ServiceSummary[]; slug: string }
  | {
      status: 'detail-error'
      services: ServiceSummary[]
      slug: string
      message: string
    }
  | { status: 'ready'; services: ServiceSummary[]; service: ServiceDetail }

export function getServicesRequestErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return 'Services could not be loaded. Please try again.'

  if (error.kind === 'network') {
    return 'The Services API is unavailable right now. Please try again.'
  }

  if (error.kind === 'invalid-response') {
    return 'The Services API returned an unexpected response. Please try again.'
  }

  return error.message
}

export function isServiceNotFoundError(error: unknown) {
  return error instanceof ApiError && error.kind === 'http' && error.status === 404
}

export function resolveServicesIndexState(state: ServicesListState): ServicesIndexState {
  if (state.status !== 'ready') return state
  if (state.services.length === 0) return { status: 'empty' }

  return { status: 'ready', services: state.services }
}

export function resolveServiceRouteState(
  slug: string,
  servicesState: ServicesListState,
  detailState: ServiceDetailState,
): ServiceRouteState {
  if (servicesState.status === 'loading') return { status: 'services-loading' }
  if (servicesState.status === 'error') {
    return { status: 'services-error', message: servicesState.message }
  }
  if (servicesState.services.length === 0) return { status: 'empty' }

  const listedService = servicesState.services.find((service) => service.slug === slug)

  if (!listedService) {
    return { status: 'not-found', services: servicesState.services, slug }
  }

  if (detailState.status === 'loading') {
    return { status: 'detail-loading', services: servicesState.services, slug }
  }
  if (detailState.status === 'error') {
    return detailState.notFound
      ? { status: 'not-found', services: servicesState.services, slug }
      : {
          status: 'detail-error',
          services: servicesState.services,
          slug,
          message: detailState.message,
        }
  }

  if (detailState.service.slug !== listedService.slug || detailState.service.id !== listedService.id) {
    return {
      status: 'detail-error',
      services: servicesState.services,
      slug,
      message: 'Published Service data is inconsistent. Please try again.',
    }
  }

  return {
    status: 'ready',
    services: servicesState.services,
    service: detailState.service,
  }
}

import { useCallback, useEffect, useState } from 'react'

import { getServiceBySlug, getServices } from '../api/services-api.ts'
import type { ServiceDetail } from '../model/service.types.ts'
import type {
  ServiceDetailState,
  ServicesListState,
} from '../presentation/services-page-state.ts'
import {
  getServicesRequestErrorMessage,
  isServiceNotFoundError,
} from '../presentation/services-page-state.ts'

export interface ServiceDetailCache {
  details: Map<string, ServiceDetail>
  prefetchedRequests: Map<string, Promise<ServiceDetail>>
}

export function createServiceDetailCache(): ServiceDetailCache {
  return {
    details: new Map(),
    prefetchedRequests: new Map(),
  }
}

export function prefetchServiceDetail(slug: string, cache: ServiceDetailCache) {
  const cachedService = cache.details.get(slug)
  if (cachedService) return Promise.resolve(cachedService)

  const existingRequest = cache.prefetchedRequests.get(slug)
  if (existingRequest) return existingRequest

  const request = getServiceBySlug(slug).then((service) => {
    cache.details.set(slug, service)
    cache.prefetchedRequests.delete(slug)
    return service
  })

  cache.prefetchedRequests.set(slug, request)
  return request
}

interface DetailRequestRecord {
  slug: string
  state: ServiceDetailState
}

export function useServicesList() {
  const [requestVersion, setRequestVersion] = useState(0)
  const [state, setState] = useState<ServicesListState>({ status: 'loading' })

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setRequestVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    void getServices({ signal: controller.signal })
      .then((services) => {
        if (!isActive) return
        setState({ status: 'ready', services })
      })
      .catch((error: unknown) => {
        if (!isActive || controller.signal.aborted) return
        setState({ status: 'error', message: getServicesRequestErrorMessage(error) })
      })

    return () => {
      isActive = false
      controller.abort()
    }
  }, [requestVersion])

  return { retry, state }
}

export function useServiceDetail(slug: string, cache: ServiceDetailCache) {
  const [requestVersion, setRequestVersion] = useState(0)
  const [request, setRequest] = useState<DetailRequestRecord>(() => {
    const cachedService = cache.details.get(slug)

    return {
      slug,
      state: cachedService
        ? { status: 'ready', service: cachedService }
        : { status: 'loading' },
    }
  })

  const cachedService = cache.details.get(slug)
  const state: ServiceDetailState =
    request.slug === slug
      ? request.state
      : cachedService
        ? { status: 'ready', service: cachedService }
        : { status: 'loading' }

  const retry = useCallback(() => {
    cache.details.delete(slug)
    cache.prefetchedRequests.delete(slug)
    setRequest({ slug, state: { status: 'loading' } })
    setRequestVersion((version) => version + 1)
  }, [cache, slug])

  useEffect(() => {
    const cachedDetail = cache.details.get(slug)

    if (cachedDetail) return

    const prefetchedRequest = cache.prefetchedRequests.get(slug)
    const controller = new AbortController()
    let isActive = true
    const detailRequest = prefetchedRequest ?? getServiceBySlug(slug, { signal: controller.signal })

    void detailRequest
      .then((service) => {
        if (!isActive) return
        cache.details.set(slug, service)
        cache.prefetchedRequests.delete(slug)
        setRequest({ slug, state: { status: 'ready', service } })
      })
      .catch((error: unknown) => {
        if (!isActive || controller.signal.aborted) return
        if (cache.prefetchedRequests.get(slug) === detailRequest) {
          cache.prefetchedRequests.delete(slug)
        }
        setRequest({
          slug,
          state: {
            status: 'error',
            message: getServicesRequestErrorMessage(error),
            notFound: isServiceNotFoundError(error),
          },
        })
      })

    return () => {
      isActive = false
      if (!prefetchedRequest) controller.abort()
    }
  }, [cache, requestVersion, slug])

  return { retry, state }
}

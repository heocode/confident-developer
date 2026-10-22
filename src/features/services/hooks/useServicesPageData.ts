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

export type ServiceDetailCache = Map<string, ServiceDetail>

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
    const cachedService = cache.get(slug)

    return {
      slug,
      state: cachedService
        ? { status: 'ready', service: cachedService }
        : { status: 'loading' },
    }
  })

  const cachedService = cache.get(slug)
  const state: ServiceDetailState =
    request.slug === slug
      ? request.state
      : cachedService
        ? { status: 'ready', service: cachedService }
        : { status: 'loading' }

  const retry = useCallback(() => {
    cache.delete(slug)
    setRequest({ slug, state: { status: 'loading' } })
    setRequestVersion((version) => version + 1)
  }, [cache, slug])

  useEffect(() => {
    const cachedDetail = cache.get(slug)

    if (cachedDetail) return

    const controller = new AbortController()
    let isActive = true

    void getServiceBySlug(slug, { signal: controller.signal })
      .then((service) => {
        if (!isActive) return
        cache.set(slug, service)
        setRequest({ slug, state: { status: 'ready', service } })
      })
      .catch((error: unknown) => {
        if (!isActive || controller.signal.aborted) return
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
      controller.abort()
    }
  }, [cache, requestVersion, slug])

  return { retry, state }
}

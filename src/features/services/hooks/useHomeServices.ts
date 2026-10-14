import { useCallback, useEffect, useState } from 'react'

import { ApiError } from '../../../api/api-error.ts'
import { getHomeServices } from '../api/services-api.ts'
import type { HomeService } from '../model/service.types.ts'
import { createHomeServicesPresentation } from '../presentation/home-services.ts'
import { serviceIconAssets } from '../presentation/service-icon-assets.ts'

type HomeServicesState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; message: string }
  | { status: 'ready'; services: readonly HomeService[] }

function getServicesErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return 'Services could not be loaded. Please try again.'

  if (error.kind === 'network') {
    return 'Services are unavailable right now. Please try again.'
  }

  if (error.kind === 'invalid-response') {
    return 'The Services API returned an unexpected response. Please try again.'
  }

  return error.message
}

export function useHomeServices() {
  const [requestVersion, setRequestVersion] = useState(0)
  const [state, setState] = useState<HomeServicesState>({ status: 'loading' })

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setRequestVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    void getHomeServices({ signal: controller.signal })
      .then((services) => {
        if (!isActive) return

        const presentation = createHomeServicesPresentation(services, serviceIconAssets)
        setState(
          presentation.length > 0
            ? { status: 'ready', services: presentation }
            : { status: 'empty' },
        )
      })
      .catch((error: unknown) => {
        if (!isActive || controller.signal.aborted) return
        setState({ status: 'error', message: getServicesErrorMessage(error) })
      })

    return () => {
      isActive = false
      controller.abort()
    }
  }, [requestVersion])

  return { retry, state }
}

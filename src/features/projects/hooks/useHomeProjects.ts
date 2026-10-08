import { useCallback, useEffect, useState } from 'react'

import { ApiError } from '../../../api/api-error.ts'
import { getHomeProjects } from '../api/projects-api.ts'
import type { HomeProjectsPresentation } from '../presentation/home-projects.ts'
import { createHomeProjectsPresentation } from '../presentation/home-projects.ts'

type HomeProjectsState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; message: string }
  | ({ status: 'ready' } & HomeProjectsPresentation)

function getProjectsErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return 'Projects could not be loaded. Please try again.'

  if (error.kind === 'network') {
    return 'The projects service is unavailable right now. Please try again.'
  }

  if (error.kind === 'invalid-response') {
    return 'The projects service returned an unexpected response. Please try again.'
  }

  return error.message
}

export function useHomeProjects() {
  const [requestVersion, setRequestVersion] = useState(0)
  const [state, setState] = useState<HomeProjectsState>({ status: 'loading' })

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setRequestVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    void getHomeProjects({ signal: controller.signal })
      .then((projects) => {
        if (!isActive) return

        const presentation = createHomeProjectsPresentation(projects)
        setState(presentation ? { status: 'ready', ...presentation } : { status: 'empty' })
      })
      .catch((error: unknown) => {
        if (!isActive || controller.signal.aborted) return
        setState({ status: 'error', message: getProjectsErrorMessage(error) })
      })

    return () => {
      isActive = false
      controller.abort()
    }
  }, [requestVersion])

  return { retry, state }
}

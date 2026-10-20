import { useCallback, useEffect, useState } from 'react'

import { getProjectBySlug, getProjects } from '../api/projects-api.ts'
import type { PublicProjectDetail } from '../model/project.types.ts'
import type { ProjectDetailState, ProjectsListState } from '../presentation/projects-page-state.ts'
import {
  getProjectsRequestErrorMessage,
  isProjectNotFoundError,
} from '../presentation/projects-page-state.ts'

export type ProjectDetailCache = Map<string, PublicProjectDetail>

interface DetailRequestRecord {
  slug: string
  state: ProjectDetailState
}

export function useProjectsList() {
  const [requestVersion, setRequestVersion] = useState(0)
  const [state, setState] = useState<ProjectsListState>({ status: 'loading' })

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setRequestVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    void getProjects({ signal: controller.signal })
      .then((projects) => {
        if (!isActive) return
        setState({ status: 'ready', projects })
      })
      .catch((error: unknown) => {
        if (!isActive || controller.signal.aborted) return
        setState({ status: 'error', message: getProjectsRequestErrorMessage(error) })
      })

    return () => {
      isActive = false
      controller.abort()
    }
  }, [requestVersion])

  return { retry, state }
}

export function useProjectDetail(slug: string, cache: ProjectDetailCache) {
  const [requestVersion, setRequestVersion] = useState(0)
  const [request, setRequest] = useState<DetailRequestRecord>(() => {
    const cachedProject = cache.get(slug)
    return {
      slug,
      state: cachedProject
        ? { status: 'ready', project: cachedProject }
        : { status: 'loading' },
    }
  })

  const cachedProject = cache.get(slug)
  const state: ProjectDetailState =
    request.slug === slug
      ? request.state
      : cachedProject
        ? { status: 'ready', project: cachedProject }
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

    void getProjectBySlug(slug, { signal: controller.signal })
      .then((project) => {
        if (!isActive) return
        cache.set(slug, project)
        setRequest({ slug, state: { status: 'ready', project } })
      })
      .catch((error: unknown) => {
        if (!isActive || controller.signal.aborted) return
        setRequest({
          slug,
          state: {
            status: 'error',
            message: getProjectsRequestErrorMessage(error),
            notFound: isProjectNotFoundError(error),
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

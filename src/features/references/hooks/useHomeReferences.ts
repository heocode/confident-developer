import { useCallback, useEffect, useRef, useState } from 'react'

import { ApiError } from '../../../api/api-error.ts'
import { getReferencesPage } from '../api/references-api.ts'
import {
  appendUniqueReferences,
  hasNextReferencePage,
} from '../model/reference-list-state.ts'
import type {
  PublicReference,
  ReferenceEmptyState,
  ReferencePagination,
} from '../model/reference.types.ts'

const HOME_REFERENCES_PAGE_SIZE = 10

interface ReadyReferencesState {
  status: 'ready'
  items: PublicReference[]
  pagination: ReferencePagination
  isLoadingMore: boolean
  loadMoreErrorMessage: string | null
}

export type HomeReferencesState =
  | { status: 'loading' }
  | { status: 'empty'; emptyState: ReferenceEmptyState | null }
  | { status: 'error'; message: string }
  | ReadyReferencesState

function getReferencesErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return 'References could not be loaded. Please try again.'

  if (error.kind === 'network') {
    return 'The references service is unavailable right now. Please try again.'
  }

  if (error.kind === 'invalid-response') {
    return 'The references service returned an unexpected response. Please try again.'
  }

  return error.message
}

export function useHomeReferences() {
  const [requestVersion, setRequestVersion] = useState(0)
  const [state, setState] = useState<HomeReferencesState>({ status: 'loading' })
  const isMountedRef = useRef(false)
  const loadMoreControllerRef = useRef<AbortController | null>(null)

  const retry = useCallback(() => {
    loadMoreControllerRef.current?.abort()
    loadMoreControllerRef.current = null
    setState({ status: 'loading' })
    setRequestVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      loadMoreControllerRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    void getReferencesPage(
      { page: 1, limit: HOME_REFERENCES_PAGE_SIZE },
      { signal: controller.signal },
    )
      .then(({ emptyState, items, pagination }) => {
        if (!isActive) return
        setState(
          items.length === 0
            ? { status: 'empty', emptyState }
            : {
                status: 'ready',
                items,
                pagination,
                isLoadingMore: false,
                loadMoreErrorMessage: null,
              },
        )
      })
      .catch((error: unknown) => {
        if (!isActive || controller.signal.aborted) return
        setState({ status: 'error', message: getReferencesErrorMessage(error) })
      })

    return () => {
      isActive = false
      controller.abort()
    }
  }, [requestVersion])

  const loadNextPage = useCallback(async () => {
    if (
      state.status !== 'ready' ||
      state.isLoadingMore ||
      !hasNextReferencePage(state.pagination) ||
      loadMoreControllerRef.current
    ) {
      return
    }

    const controller = new AbortController()
    const nextPage = state.pagination.page + 1
    loadMoreControllerRef.current = controller
    setState((currentState) =>
      currentState.status === 'ready'
        ? { ...currentState, isLoadingMore: true, loadMoreErrorMessage: null }
        : currentState,
    )

    try {
      const result = await getReferencesPage(
        { page: nextPage, limit: HOME_REFERENCES_PAGE_SIZE },
        { signal: controller.signal },
      )
      if (!isMountedRef.current || controller.signal.aborted) return

      setState((currentState) =>
        currentState.status === 'ready'
          ? {
              ...currentState,
              items: appendUniqueReferences(currentState.items, result.items),
              pagination: result.pagination,
              isLoadingMore: false,
              loadMoreErrorMessage: null,
            }
          : currentState,
      )
    } catch (error) {
      if (!isMountedRef.current || controller.signal.aborted) return

      setState((currentState) =>
        currentState.status === 'ready'
          ? {
              ...currentState,
              isLoadingMore: false,
              loadMoreErrorMessage: getReferencesErrorMessage(error),
            }
          : currentState,
      )
    } finally {
      if (loadMoreControllerRef.current === controller) loadMoreControllerRef.current = null
    }
  }, [state])

  return { loadNextPage, retry, state }
}

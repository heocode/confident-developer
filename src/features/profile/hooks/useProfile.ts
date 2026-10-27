import { useCallback, useEffect, useRef, useState } from 'react'

import { getGitHubSummary } from '../api/github-summary-api.ts'
import {
  getProfilePost,
  getProfilePostInteraction,
  likeProfilePost,
  recordProfilePostView,
  unlikeProfilePost,
} from '../api/profile-post-api.ts'
import {
  getConfirmedProfilePostEngagement,
  getOptimisticProfilePostEngagement,
  getProfileRequestErrorMessage,
  isStaleProfilePostRevision,
} from '../model/profile-state.ts'
import type { GitHubSummary, ProfilePost } from '../model/profile.types.ts'

type ProfileInteractionStatus = 'error' | 'loading' | 'ready'

export type ProfileState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready'
      githubSummary: GitHubSummary | null
      githubErrorMessage: string | null
      post: ProfilePost
      liked: boolean
      interactionStatus: ProfileInteractionStatus
      interactionErrorMessage: string | null
      isLikePending: boolean
      likeErrorMessage: string | null
      isViewPending: boolean
    }

const INITIAL_STATE: ProfileState = { status: 'loading' }

export function useProfile() {
  const [requestVersion, setRequestVersion] = useState(0)
  const [state, setState] = useState<ProfileState>(INITIAL_STATE)
  const isMountedRef = useRef(false)
  const isLikePendingRef = useRef(false)
  const operationControllersRef = useRef(new Set<AbortController>())
  const viewedRevisionsRef = useRef(new Set<number>())

  const retry = useCallback(() => {
    for (const controller of operationControllersRef.current) controller.abort()
    operationControllersRef.current.clear()
    isLikePendingRef.current = false
    setState(INITIAL_STATE)
    setRequestVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    const operationControllers = operationControllersRef.current
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
      for (const controller of operationControllers) controller.abort()
      operationControllers.clear()
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    async function loadProfile() {
      const [githubResult, postResult] = await Promise.allSettled([
        getGitHubSummary({ signal: controller.signal }),
        getProfilePost({ signal: controller.signal }),
      ])

      if (!isActive || controller.signal.aborted) return

      if (postResult.status === 'rejected') {
        setState({
          status: 'error',
          message: getProfileRequestErrorMessage(postResult.reason, 'profile'),
        })
        return
      }

      const githubSummary = githubResult.status === 'fulfilled' ? githubResult.value : null
      const githubErrorMessage =
        githubResult.status === 'rejected'
          ? getProfileRequestErrorMessage(githubResult.reason, 'github')
          : null
      const post = postResult.value

      setState({
        status: 'ready',
        githubSummary,
        githubErrorMessage,
        post,
        liked: false,
        interactionStatus: 'loading',
        interactionErrorMessage: null,
        isLikePending: false,
        likeErrorMessage: null,
        isViewPending: false,
      })

      try {
        const interaction = await getProfilePostInteraction(post.revision, {
          signal: controller.signal,
        })

        if (!isActive || controller.signal.aborted) return

        setState((currentState) => {
          if (currentState.status !== 'ready' || currentState.post.revision !== interaction.revision) {
            return currentState
          }

          const engagement = getConfirmedProfilePostEngagement(interaction)

          return {
            ...currentState,
            post: { ...currentState.post, likes: engagement.likes },
            liked: engagement.liked,
            interactionStatus: 'ready',
            interactionErrorMessage: null,
          }
        })
      } catch (error) {
        if (!isActive || controller.signal.aborted) return

        if (isStaleProfilePostRevision(error)) {
          retry()
          return
        }

        setState((currentState) =>
          currentState.status === 'ready'
            ? {
                ...currentState,
                interactionStatus: 'error',
                interactionErrorMessage: getProfileRequestErrorMessage(error, 'profile'),
              }
            : currentState,
        )
      }
    }

    void loadProfile()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [requestVersion, retry])

  const toggleLike = useCallback(async () => {
    if (
      state.status !== 'ready' ||
      state.interactionStatus !== 'ready' ||
      isLikePendingRef.current
    ) {
      return
    }

    const controller = new AbortController()
    const revision = state.post.revision
    const previousEngagement = { liked: state.liked, likes: state.post.likes }
    const optimisticEngagement = getOptimisticProfilePostEngagement(previousEngagement)

    isLikePendingRef.current = true
    operationControllersRef.current.add(controller)
    setState((currentState) =>
      currentState.status === 'ready' && currentState.post.revision === revision
        ? {
            ...currentState,
            post: { ...currentState.post, likes: optimisticEngagement.likes },
            liked: optimisticEngagement.liked,
            isLikePending: true,
            likeErrorMessage: null,
          }
        : currentState,
    )

    try {
      const interaction = previousEngagement.liked
        ? await unlikeProfilePost(revision, { signal: controller.signal })
        : await likeProfilePost(revision, { signal: controller.signal })

      if (!isMountedRef.current || controller.signal.aborted) return

      setState((currentState) => {
        if (currentState.status !== 'ready' || currentState.post.revision !== interaction.revision) {
          return currentState
        }

        const engagement = getConfirmedProfilePostEngagement(interaction)

        return {
          ...currentState,
          post: { ...currentState.post, likes: engagement.likes },
          liked: engagement.liked,
          isLikePending: false,
        }
      })
    } catch (error) {
      if (!isMountedRef.current || controller.signal.aborted) return

      if (isStaleProfilePostRevision(error)) {
        retry()
        return
      }

      setState((currentState) =>
        currentState.status === 'ready' && currentState.post.revision === revision
          ? {
              ...currentState,
              post: { ...currentState.post, likes: previousEngagement.likes },
              liked: previousEngagement.liked,
              isLikePending: false,
              likeErrorMessage: getProfileRequestErrorMessage(error, 'profile'),
            }
          : currentState,
      )
    } finally {
      operationControllersRef.current.delete(controller)
      isLikePendingRef.current = false
    }
  }, [retry, state])

  const recordView = useCallback(async () => {
    if (state.status !== 'ready') return

    const revision = state.post.revision
    if (viewedRevisionsRef.current.has(revision)) return

    const controller = new AbortController()
    viewedRevisionsRef.current.add(revision)
    operationControllersRef.current.add(controller)
    setState((currentState) =>
      currentState.status === 'ready' && currentState.post.revision === revision
        ? { ...currentState, isViewPending: true }
        : currentState,
    )

    try {
      const view = await recordProfilePostView(revision, { signal: controller.signal })

      if (!isMountedRef.current || controller.signal.aborted) return

      setState((currentState) =>
        currentState.status === 'ready' && currentState.post.revision === view.revision
          ? {
              ...currentState,
              post: { ...currentState.post, views: view.views },
              isViewPending: false,
            }
          : currentState,
      )
    } catch (error) {
      if (!isMountedRef.current || controller.signal.aborted) return

      if (isStaleProfilePostRevision(error)) {
        retry()
        return
      }

      setState((currentState) =>
        currentState.status === 'ready' && currentState.post.revision === revision
          ? { ...currentState, isViewPending: false }
          : currentState,
      )
    } finally {
      operationControllersRef.current.delete(controller)
    }
  }, [retry, state])

  return { recordView, retry, state, toggleLike }
}

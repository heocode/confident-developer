import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

import replayIconUrl from '../../../assets/icons/actions/replay.svg'
import {
  useDocumentVisibility,
  usePrefersReducedMotion,
  useServiceRailVisibility,
} from '../hooks/useServiceMediaEnvironment.ts'
import { getServiceVideoPlaybackIntent } from '../presentation/service-video-playback.ts'
import type { MotionShowcaseAssetPresentation } from '../presentation/services-page.ts'
import styles from './ServiceVideoShowcase.module.css'

interface ServiceVideoShowcaseProps {
  asset: MotionShowcaseAssetPresentation
  isPriority: boolean
  railRef: RefObject<HTMLElement | null>
}

export function ServiceVideoShowcase({
  asset,
  isPriority,
  railRef,
}: ServiceVideoShowcaseProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasActivated, setHasActivated] = useState(false)
  const [hasEnded, setHasEnded] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)
  const [hasPreviewFailed, setHasPreviewFailed] = useState(false)
  const [manualPlaybackRequested, setManualPlaybackRequested] = useState(false)
  const [playbackWasBlocked, setPlaybackWasBlocked] = useState(false)
  const isDocumentVisible = useDocumentVisibility()
  const isPanelVisible = useServiceRailVisibility(frameRef, railRef)
  const prefersReducedMotion = usePrefersReducedMotion()
  const playbackIntent = getServiceVideoPlaybackIntent({
    hasActivated,
    hasEnded,
    hasFailed,
    isDocumentVisible,
    isPanelVisible,
    manualPlaybackRequested,
    prefersReducedMotion,
  })

  useEffect(() => {
    if (!isPanelVisible || prefersReducedMotion || hasActivated) return

    const animationFrame = window.requestAnimationFrame(() => setHasActivated(true))

    return () => window.cancelAnimationFrame(animationFrame)
  }, [hasActivated, isPanelVisible, prefersReducedMotion])

  const requestPlayback = useCallback(async (video: HTMLVideoElement) => {
    try {
      await video.play()
      setPlaybackWasBlocked(false)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setPlaybackWasBlocked(true)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current

    if (!video) return

    if (playbackIntent === 'play') void requestPlayback(video)
    else video.pause()
  }, [playbackIntent, requestPlayback])

  useEffect(
    () => () => {
      videoRef.current?.pause()
    },
    [],
  )

  const handlePlaybackControl = () => {
    const video = videoRef.current

    setManualPlaybackRequested(true)
    setHasActivated(true)
    setHasEnded(false)
    setPlaybackWasBlocked(false)

    if (!video) return

    if (hasEnded) video.currentTime = 0
    void requestPlayback(video)
  }

  const showPlaybackControl =
    hasEnded ||
    playbackWasBlocked ||
    (prefersReducedMotion && !manualPlaybackRequested)
  const controlLabel = hasEnded ? 'Replay video' : 'Play video'
  const previewUnavailable = hasPreviewFailed && (!hasActivated || hasFailed)

  return (
    <div className={styles.frame} ref={frameRef}>
      {previewUnavailable ? (
        <p className={styles.mediaError} role="status">
          Showcase preview unavailable
        </p>
      ) : hasActivated && !hasFailed ? (
        <video
          aria-label={asset.alt}
          className={styles.media}
          height={asset.height ?? asset.preview.height}
          muted
          onCanPlay={() => {
            if (playbackIntent === 'play' && videoRef.current) {
              void requestPlayback(videoRef.current)
            }
          }}
          onEnded={() => setHasEnded(true)}
          onError={() => setHasFailed(true)}
          onPlay={() => setPlaybackWasBlocked(false)}
          playsInline
          poster={asset.preview.url}
          preload="metadata"
          ref={videoRef}
          src={asset.url}
          width={asset.width ?? asset.preview.width}
        />
      ) : (
        <img
          alt={asset.preview.alt}
          className={styles.media}
          decoding="async"
          fetchPriority={isPriority ? 'high' : 'auto'}
          height={asset.preview.height}
          loading={isPriority ? 'eager' : 'lazy'}
          onError={() => setHasPreviewFailed(true)}
          src={asset.preview.url}
          width={asset.preview.width}
        />
      )}

      {showPlaybackControl && !previewUnavailable ? (
        <div className={styles.replayOverlay}>
          <button
            aria-label={controlLabel}
            className={styles.replayButton}
            onClick={handlePlaybackControl}
            type="button"
          >
            <img alt="" src={replayIconUrl} />
          </button>
        </div>
      ) : null}

      {hasFailed && !hasPreviewFailed ? (
        <span className={styles.visuallyHidden} role="status">
          Video unavailable. Showing its preview image.
        </span>
      ) : null}
    </div>
  )
}

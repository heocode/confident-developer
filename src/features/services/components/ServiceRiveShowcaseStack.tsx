import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'

import {
  useDocumentVisibility,
  usePrefersReducedMotion,
  useServiceRailVisibility,
} from '../hooks/useServiceMediaEnvironment.ts'
import {
  getServiceBlockEnterDelay,
  getServiceBlockExitDelay,
} from '../presentation/service-detail-motion.ts'
import { getServiceRivePlaybackIntent } from '../presentation/service-rive-playback.ts'
import type { AnimationShowcaseAssetPresentation } from '../presentation/services-page.ts'
import entranceStyles from './ServiceBlockEntrance.module.css'
import type { ServiceRiveController } from './service-rive-runtime.types.ts'
import styles from './ServiceRiveShowcaseStack.module.css'
import railStyles from './ServiceShowcaseRail.module.css'

const LazyServiceRiveAsset = lazy(async () => {
  const module = await import('./ServiceRiveAsset.tsx')

  return { default: module.ServiceRiveAsset }
})

interface ServiceRiveShowcaseStackProps {
  assets: AnimationShowcaseAssetPresentation[]
  blockCount: number
  enterOffset: number
  isPriority: boolean
  railRef: RefObject<HTMLElement | null>
}

type EnterStyle = CSSProperties & {
  '--service-block-enter-delay': string
  '--service-block-exit-delay': string
}

function getEnterStyle(index: number, blockCount: number): EnterStyle {
  return {
    '--service-block-enter-delay': `${getServiceBlockEnterDelay(index)}ms`,
    '--service-block-exit-delay': `${getServiceBlockExitDelay(index, blockCount)}ms`,
  }
}

function addId(ids: Set<string>, id: string) {
  if (ids.has(id)) return ids

  const nextIds = new Set(ids)
  nextIds.add(id)
  return nextIds
}

export function ServiceRiveShowcaseStack({
  assets,
  blockCount,
  enterOffset,
  isPriority,
  railRef,
}: ServiceRiveShowcaseStackProps) {
  const stackRef = useRef<HTMLDivElement>(null)
  const controllersRef = useRef(new Map<string, ServiceRiveController>())
  const playbackActiveRef = useRef(false)
  const startFrameRef = useRef<number | null>(null)
  const revealFrameRef = useRef<number | null>(null)
  const [failedIds, setFailedIds] = useState(new Set<string>())
  const [hasRuntimeRequested, setHasRuntimeRequested] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [readyIds, setReadyIds] = useState(new Set<string>())
  const [settledIds, setSettledIds] = useState(new Set<string>())
  const isDocumentVisible = useDocumentVisibility()
  const isStackVisible = useServiceRailVisibility(stackRef, railRef)
  const prefersReducedMotion = usePrefersReducedMotion()
  const allAssetsSettled = settledIds.size === assets.length
  const playbackIntent = getServiceRivePlaybackIntent({
    allAssetsSettled,
    hasStarted,
    isDocumentVisible,
    isStackVisible,
    prefersReducedMotion,
  })

  useEffect(() => {
    if (
      !isStackVisible ||
      prefersReducedMotion ||
      hasRuntimeRequested
    ) {
      return
    }

    const animationFrame = window.requestAnimationFrame(() =>
      setHasRuntimeRequested(true),
    )

    return () => window.cancelAnimationFrame(animationFrame)
  }, [hasRuntimeRequested, isStackVisible, prefersReducedMotion])

  const handleReady = useCallback((controller: ServiceRiveController) => {
    controllersRef.current.set(controller.assetId, controller)
    setReadyIds((currentIds) => addId(currentIds, controller.assetId))
    setSettledIds((currentIds) => addId(currentIds, controller.assetId))
  }, [])

  const handleFailure = useCallback((assetId: string) => {
    setFailedIds((currentIds) => addId(currentIds, assetId))
    setSettledIds((currentIds) => addId(currentIds, assetId))
  }, [])

  useEffect(() => {
    const controllers = controllersRef.current

    if (playbackIntent === 'start') {
      startFrameRef.current = window.requestAnimationFrame(() => {
        startFrameRef.current = null
        controllers.forEach(({ play }) => play())
        playbackActiveRef.current = true

        revealFrameRef.current = window.requestAnimationFrame(() => {
          revealFrameRef.current = null
          setHasStarted(true)
        })
      })
    } else if (playbackIntent === 'play' && !playbackActiveRef.current) {
      controllers.forEach(({ play }) => play())
      playbackActiveRef.current = true
    } else if (playbackIntent === 'pause' && playbackActiveRef.current) {
      controllers.forEach(({ pause }) => pause())
      playbackActiveRef.current = false
    }

    return () => {
      if (startFrameRef.current !== null) {
        window.cancelAnimationFrame(startFrameRef.current)
        startFrameRef.current = null
      }
      if (revealFrameRef.current !== null) {
        window.cancelAnimationFrame(revealFrameRef.current)
        revealFrameRef.current = null
      }
    }
  }, [playbackIntent])

  useEffect(
    () => () => {
      controllersRef.current.forEach(({ pause }) => pause())
    },
    [],
  )

  const showRuntime = hasStarted && !prefersReducedMotion

  return (
    <div className={styles.stack} ref={stackRef}>
      {assets.map((asset, assetIndex) => {
        const isReady = readyIds.has(asset.id)
        const isRuntimeVisible = showRuntime && isReady

        return (
          <div
            className={`${railStyles.panel} ${railStyles.compactPanel} ${entranceStyles.block} ${styles.panel}`}
            data-rive-active={isRuntimeVisible ? '' : undefined}
            key={asset.id}
            style={getEnterStyle(enterOffset + assetIndex, blockCount)}
          >
            <div className={styles.surface}>
              {!isRuntimeVisible ? (
                <img
                  alt={asset.preview.alt}
                  className={styles.preview}
                  decoding="async"
                  fetchPriority={
                    isPriority && assetIndex === 0 ? 'high' : 'auto'
                  }
                  height={asset.preview.height}
                  loading={isPriority && assetIndex === 0 ? 'eager' : 'lazy'}
                  src={asset.preview.url}
                  width={asset.preview.width}
                />
              ) : null}

              {hasRuntimeRequested ? (
                <div className={styles.runtime}>
                  <Suspense fallback={null}>
                    <LazyServiceRiveAsset
                      asset={asset}
                      onFailure={handleFailure}
                      onReady={handleReady}
                    />
                  </Suspense>
                </div>
              ) : null}
            </div>

            {failedIds.has(asset.id) ? (
              <span className={styles.visuallyHidden} role="status">
                Animation unavailable. Showing its preview image.
              </span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

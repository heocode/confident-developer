import riveWasmUrl from '@rive-app/canvas/rive.wasm?url'
import {
  Alignment,
  Fit,
  Layout,
  RuntimeLoader,
  useRive,
} from '@rive-app/react-canvas'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { selectServiceRiveStateMachine } from '../presentation/service-rive-playback.ts'
import type { AnimationShowcaseAssetPresentation } from '../presentation/services-page.ts'
import type { ServiceRiveController } from './service-rive-runtime.types.ts'
import styles from './ServiceRiveAsset.module.css'

RuntimeLoader.setWasmUrl(riveWasmUrl)
RuntimeLoader.setWasmFallbackUrl(null)

interface ServiceRiveAssetProps {
  asset: AnimationShowcaseAssetPresentation
  onFailure: (assetId: string) => void
  onReady: (controller: ServiceRiveController) => void
}

export function ServiceRiveAsset({
  asset,
  onFailure,
  onReady,
}: ServiceRiveAssetProps) {
  const hasReportedResultRef = useRef(false)
  const layout = useMemo(
    () => new Layout({ alignment: Alignment.Center, fit: Fit.Contain }),
    [],
  )
  const reportFailure = useCallback(() => {
    if (hasReportedResultRef.current) return

    hasReportedResultRef.current = true
    onFailure(asset.id)
  }, [asset.id, onFailure])
  const { rive, RiveComponent } = useRive(
    {
      autoBind: true,
      autoplay: false,
      layout,
      onLoadError: reportFailure,
      shouldDisableRiveListeners: true,
      src: asset.url,
    },
    { shouldUseIntersectionObserver: false },
  )

  useEffect(() => {
    if (!rive || hasReportedResultRef.current) return

    const selection = selectServiceRiveStateMachine(rive.stateMachineNames)

    if (!selection.machineName) {
      reportFailure()
      return
    }

    hasReportedResultRef.current = true
    const machineName = selection.machineName

    // Without an initial machine name, Rive instances the first linear animation.
    // Reset onto the discovered machine so that static pose cannot remain beneath it.
    rive.reset({ autoBind: true, autoplay: false, stateMachine: machineName })
    const hoveredProperty = rive.viewModelInstance?.boolean('hovered')

    onReady({
      assetId: asset.id,
      pause: () => rive.pause(machineName),
      play: () => rive.play(machineName),
      setHovered: (isHovered) => {
        if (hoveredProperty) hoveredProperty.value = isHovered
      },
    })
  }, [asset.id, onReady, reportFailure, rive])

  return (
    <RiveComponent
      aria-label={asset.alt}
      className={styles.canvas}
      role="img"
    />
  )
}

import { useLayoutEffect, useMemo, useRef, useState } from 'react'

import {
  calculateServiceShowcaseLayout,
  groupServiceShowcaseAssets,
  type ServiceShowcaseLayout,
} from '../presentation/service-showcase-layout.ts'
import type { ShowcaseAssetPresentation } from '../presentation/services-page.ts'

interface ElementSize {
  height: number
  width: number
}

function layoutsMatch(
  currentLayout: ServiceShowcaseLayout | null,
  nextLayout: ServiceShowcaseLayout | null,
) {
  return (
    currentLayout?.height === nextLayout?.height &&
    currentLayout?.compactPanelSize === nextLayout?.compactPanelSize &&
    currentLayout?.gap === nextLayout?.gap &&
    currentLayout?.informationPanelWidth === nextLayout?.informationPanelWidth &&
    currentLayout?.scale === nextLayout?.scale &&
    currentLayout?.groupWidths.length === nextLayout?.groupWidths.length &&
    currentLayout?.groupWidths.every(
      (width, index) => width === nextLayout?.groupWidths[index],
    )
  )
}

export function useServiceShowcaseLayout(
  assets: readonly ShowcaseAssetPresentation[],
) {
  const railRef = useRef<HTMLElement>(null)
  const [layout, setLayout] = useState<ServiceShowcaseLayout | null>(null)
  const groups = useMemo(() => groupServiceShowcaseAssets(assets), [assets])

  useLayoutEffect(() => {
    const container = railRef.current?.parentElement

    if (!container) return

    const updateLayout = ({ height, width }: ElementSize) => {
      const nextLayout = calculateServiceShowcaseLayout({
        containerHeight: Math.round(height * 100) / 100,
        containerWidth: Math.round(width * 100) / 100,
        groupAspectRatios: groups.map((group) => group.assets[0].aspectRatio),
        groups,
      })

      setLayout((currentLayout) =>
        layoutsMatch(currentLayout, nextLayout) ? currentLayout : nextLayout,
      )
    }
    const measureContainer = () => updateLayout(container.getBoundingClientRect())

    measureContainer()

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]

      if (entry) updateLayout(entry.contentRect)
    })

    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [groups])

  return { groups, layout, railRef }
}

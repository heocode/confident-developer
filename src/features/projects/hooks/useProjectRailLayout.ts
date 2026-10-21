import { useLayoutEffect, useRef, useState } from 'react'

import {
  calculateProjectRailLayout,
  type ProjectRailLayout,
} from '../presentation/project-rail-layout.ts'
import type { ProjectScreenshotPresentation } from '../presentation/projects-page.ts'

interface ElementSize {
  height: number
  width: number
}

function layoutsMatch(
  currentLayout: ProjectRailLayout | null,
  nextLayout: ProjectRailLayout | null,
) {
  return (
    currentLayout?.height === nextLayout?.height &&
    currentLayout?.width === nextLayout?.width &&
    currentLayout?.screenshotWidths.every(
      (width, index) => width === nextLayout?.screenshotWidths[index],
    )
  )
}

export function useProjectRailLayout(
  screenshots: readonly ProjectScreenshotPresentation[],
) {
  const railRef = useRef<HTMLElement>(null)
  const [layout, setLayout] = useState<ProjectRailLayout | null>(null)

  useLayoutEffect(() => {
    const container = railRef.current?.parentElement

    if (!container) return

    const updateLayout = ({ height, width }: ElementSize) => {
      const nextLayout = calculateProjectRailLayout({
        containerHeight: Math.round(height * 100) / 100,
        containerWidth: Math.round(width * 100) / 100,
        screenshotAspectRatios: screenshots.map(({ aspectRatio }) => aspectRatio),
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
  }, [screenshots])

  return { layout, railRef }
}

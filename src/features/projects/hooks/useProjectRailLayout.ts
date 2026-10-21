import { useLayoutEffect, useRef, useState } from 'react'

import {
  calculateProjectRailLayout,
  type ProjectRailLayout,
} from '../presentation/project-rail-layout.ts'

interface ElementSize {
  height: number
  width: number
}

export function useProjectRailLayout() {
  const railRef = useRef<HTMLElement>(null)
  const [layout, setLayout] = useState<ProjectRailLayout | null>(null)

  useLayoutEffect(() => {
    const container = railRef.current?.parentElement

    if (!container) return

    const updateLayout = ({ height, width }: ElementSize) => {
      const nextLayout = calculateProjectRailLayout({
        containerHeight: Math.round(height * 100) / 100,
        containerWidth: Math.round(width * 100) / 100,
      })

      setLayout((currentLayout) =>
        currentLayout?.height === nextLayout?.height &&
        currentLayout?.width === nextLayout?.width
          ? currentLayout
          : nextLayout,
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
  }, [])

  return { layout, railRef }
}

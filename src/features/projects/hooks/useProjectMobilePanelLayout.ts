import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import {
  calculateProjectMobilePanelLayout,
  type ProjectMobilePanelLayout,
} from '../presentation/project-mobile-panel-layout.ts'

interface ElementSize {
  height: number
  width: number
}

const MOBILE_PROJECTS_QUERY = '(max-width: 48rem)'

export function useProjectMobilePanelLayout(isEnabled: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState<ElementSize | null>(null)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(MOBILE_PROJECTS_QUERY).matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_PROJECTS_QUERY)
    const updateViewportMode = () => setIsMobile(mediaQuery.matches)

    updateViewportMode()
    mediaQuery.addEventListener('change', updateViewportMode)

    return () => mediaQuery.removeEventListener('change', updateViewportMode)
  }, [])

  useLayoutEffect(() => {
    if (!isEnabled || !isMobile) return

    const container = containerRef.current?.parentElement

    if (!container) return

    const updateSize = ({ height, width }: ElementSize) => {
      const nextSize = {
        height: Math.round(height * 100) / 100,
        width: Math.round(width * 100) / 100,
      }

      setContainerSize((currentSize) =>
        currentSize?.height === nextSize.height && currentSize.width === nextSize.width
          ? currentSize
          : nextSize,
      )
    }
    const measureContainer = () => updateSize(container.getBoundingClientRect())

    measureContainer()

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]

      if (entry) updateSize(entry.contentRect)
    })

    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [isEnabled, isMobile])

  const layout: ProjectMobilePanelLayout | null =
    isEnabled && isMobile && containerSize
      ? calculateProjectMobilePanelLayout({
          containerHeight: containerSize.height,
          containerWidth: containerSize.width,
        })
      : null

  return { containerRef, layout }
}

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import type { ProjectScreenshotPresentation } from '../presentation/projects-page.ts'
import {
  calculateProjectGalleryLayout,
  type ProjectGalleryLayout,
} from '../presentation/project-gallery-layout.ts'

interface ElementSize {
  height: number
  width: number
}

const DESKTOP_PROJECTS_QUERY = '(min-width: 48.0625rem)'

export function useProjectGalleryLayout(
  screenshots: ProjectScreenshotPresentation[],
  isEnabled: boolean,
) {
  const galleryRef = useRef<HTMLElement>(null)
  const [containerSize, setContainerSize] = useState<ElementSize | null>(null)
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia(DESKTOP_PROJECTS_QUERY).matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_PROJECTS_QUERY)
    const updateViewportMode = () => setIsDesktop(mediaQuery.matches)

    updateViewportMode()
    mediaQuery.addEventListener('change', updateViewportMode)

    return () => mediaQuery.removeEventListener('change', updateViewportMode)
  }, [])

  useLayoutEffect(() => {
    if (!isEnabled || !isDesktop) return

    const container = galleryRef.current?.parentElement

    if (!container) return

    const updateSize = ({ height, width }: ElementSize) => {
      setContainerSize((currentSize) =>
        currentSize?.height === height && currentSize.width === width
          ? currentSize
          : { height, width },
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
  }, [isDesktop, isEnabled])

  const layout = useMemo<ProjectGalleryLayout | null>(() => {
    if (!isEnabled || !isDesktop || !containerSize) return null

    return calculateProjectGalleryLayout({
      containerHeight: containerSize.height,
      containerWidth: containerSize.width,
      screenshots,
    })
  }, [containerSize, isDesktop, isEnabled, screenshots])

  return { galleryRef, isDesktop, layout }
}

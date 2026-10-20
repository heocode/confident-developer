import { useLayoutEffect, useMemo, useRef, useState } from 'react'

import type { ProjectScreenshotPresentation } from '../presentation/projects-page.ts'
import {
  calculateProjectGalleryLayout,
  type ProjectGalleryLayout,
} from '../presentation/project-gallery-layout.ts'

interface ElementSize {
  height: number
  width: number
}

export function useProjectGalleryLayout(
  screenshots: ProjectScreenshotPresentation[],
  isEnabled: boolean,
) {
  const galleryRef = useRef<HTMLElement>(null)
  const [containerSize, setContainerSize] = useState<ElementSize | null>(null)

  useLayoutEffect(() => {
    if (!isEnabled) return

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
  }, [isEnabled])

  const layout = useMemo<ProjectGalleryLayout | null>(() => {
    if (!isEnabled || !containerSize) return null

    return calculateProjectGalleryLayout({
      containerHeight: containerSize.height,
      containerWidth: containerSize.width,
      screenshots,
    })
  }, [containerSize, isEnabled, screenshots])

  return { galleryRef, layout }
}

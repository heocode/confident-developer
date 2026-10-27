import { useCallback, useLayoutEffect, useRef } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'

import {
  getDocumentScrollGeometry,
  getScrollTopFromThumbPosition,
} from './document-scroll-indicator.ts'
import type { DocumentScrollGeometry } from './document-scroll-indicator.ts'
import styles from './DocumentScrollIndicator.module.css'

const MINIMUM_THUMB_HEIGHT = 48
const SCROLL_ACTIVITY_DURATION_MS = 900

interface DragState {
  offset: number
  pointerId: number
}

export function DocumentScrollIndicator() {
  const indicatorRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLSpanElement>(null)
  const geometryRef = useRef<DocumentScrollGeometry | null>(null)
  const dragRef = useRef<DragState | null>(null)

  const measure = useCallback(() => {
    const indicator = indicatorRef.current
    const root = document.documentElement
    if (!indicator) return null

    const geometry = getDocumentScrollGeometry({
      minimumThumbHeight: MINIMUM_THUMB_HEIGHT,
      scrollHeight: root.scrollHeight,
      scrollTop: window.scrollY,
      trackHeight: indicator.clientHeight,
      viewportHeight: root.clientHeight,
    })
    const isAvailable =
      geometry !== null && !root.hasAttribute('data-page-scroll-locked')
    const isInteractive =
      isAvailable && window.matchMedia('(min-width: 48.001rem)').matches

    geometryRef.current = isAvailable ? geometry : null
    indicator.toggleAttribute('data-scrollable', isAvailable)
    indicator.setAttribute('aria-hidden', String(!isInteractive))
    indicator.tabIndex = isInteractive ? 0 : -1

    if (!isAvailable || !geometry) return null

    indicator.style.setProperty(
      '--document-scroll-thumb-height',
      `${geometry.thumbHeight}px`,
    )
    indicator.style.setProperty(
      '--document-scroll-thumb-offset',
      `${geometry.thumbOffset}px`,
    )
    indicator.setAttribute('aria-valuemax', `${Math.round(geometry.maximumScroll)}`)
    indicator.setAttribute(
      'aria-valuenow',
      `${Math.round(geometry.progress * geometry.maximumScroll)}`,
    )
    indicator.setAttribute(
      'aria-valuetext',
      `${Math.round(geometry.progress * 100)}% scrolled`,
    )

    return geometry
  }, [])

  useLayoutEffect(() => {
    const indicator = indicatorRef.current
    if (!indicator) return

    let animationFrame: number | null = null
    let activityTimer: number | null = null

    const update = () => {
      animationFrame = null
      measure()
    }

    const scheduleUpdate = () => {
      if (animationFrame !== null) return
      animationFrame = window.requestAnimationFrame(update)
    }

    const markScrollActivity = () => {
      indicator.setAttribute('data-scroll-active', '')
      if (activityTimer !== null) window.clearTimeout(activityTimer)
      activityTimer = window.setTimeout(() => {
        activityTimer = null
        indicator.removeAttribute('data-scroll-active')
      }, SCROLL_ACTIVITY_DURATION_MS)
      scheduleUpdate()
    }

    const resizeObserver = new ResizeObserver(scheduleUpdate)
    resizeObserver.observe(document.documentElement)
    resizeObserver.observe(document.body)

    const lockObserver = new MutationObserver(scheduleUpdate)
    lockObserver.observe(document.documentElement, {
      attributeFilter: ['data-page-scroll-locked'],
    })

    window.addEventListener('resize', scheduleUpdate, { passive: true })
    window.addEventListener('scroll', markScrollActivity, { passive: true })
    measure()

    return () => {
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('scroll', markScrollActivity)
      resizeObserver.disconnect()
      lockObserver.disconnect()
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
      if (activityTimer !== null) window.clearTimeout(activityTimer)
    }
  }, [measure])

  const scrollFromPointer = (clientY: number) => {
    const indicator = indicatorRef.current
    const drag = dragRef.current
    const geometry = geometryRef.current
    if (!indicator || !drag || !geometry) return

    const pointerPosition = clientY - indicator.getBoundingClientRect().top
    const root = document.documentElement
    const previousScrollBehavior = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'
    window.scrollTo({
      top: getScrollTopFromThumbPosition(
        pointerPosition,
        drag.offset,
        geometry,
      ),
    })
    root.style.scrollBehavior = previousScrollBehavior
  }

  const beginDragging = (event: PointerEvent<HTMLDivElement>) => {
    const indicator = indicatorRef.current
    const thumb = thumbRef.current
    const geometry = measure()
    if (!indicator || !thumb || !geometry) return

    const isThumbTarget = event.target === thumb
    dragRef.current = {
      offset: isThumbTarget
        ? event.clientY - thumb.getBoundingClientRect().top
        : geometry.thumbHeight / 2,
      pointerId: event.pointerId,
    }

    indicator.setPointerCapture(event.pointerId)
    indicator.setAttribute('data-dragging', '')
    scrollFromPointer(event.clientY)
    event.preventDefault()
  }

  const continueDragging = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return
    scrollFromPointer(event.clientY)
  }

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    const indicator = indicatorRef.current
    if (!indicator || dragRef.current?.pointerId !== event.pointerId) return

    dragRef.current = null
    indicator.removeAttribute('data-dragging')
    if (indicator.hasPointerCapture(event.pointerId)) {
      indicator.releasePointerCapture(event.pointerId)
    }
  }

  const handleKeyboardScroll = (event: KeyboardEvent<HTMLDivElement>) => {
    const geometry = geometryRef.current
    if (!geometry) return

    const viewportStep = document.documentElement.clientHeight * 0.9
    const keyTargets: Partial<Record<string, number>> = {
      ArrowDown: window.scrollY + 48,
      ArrowUp: window.scrollY - 48,
      End: geometry.maximumScroll,
      Home: 0,
      PageDown: window.scrollY + viewportStep,
      PageUp: window.scrollY - viewportStep,
    }
    const target = keyTargets[event.key]
    if (target === undefined) return

    event.preventDefault()
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    window.scrollTo({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      top: target,
    })
  }

  return (
    <div
      aria-controls="main-content"
      aria-hidden="true"
      aria-label="Page position"
      aria-orientation="vertical"
      aria-valuemax={0}
      aria-valuemin={0}
      aria-valuenow={0}
      className={styles.indicator}
      onKeyDown={handleKeyboardScroll}
      onLostPointerCapture={stopDragging}
      onPointerCancel={stopDragging}
      onPointerDown={beginDragging}
      onPointerMove={continueDragging}
      onPointerUp={stopDragging}
      ref={indicatorRef}
      role="scrollbar"
      tabIndex={-1}
    >
      <span aria-hidden="true" className={styles.thumb} ref={thumbRef} />
    </div>
  )
}

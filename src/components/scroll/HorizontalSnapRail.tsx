import { forwardRef, useCallback, useLayoutEffect, useRef } from 'react'
import type {
  ComponentPropsWithoutRef,
  ForwardedRef,
  KeyboardEvent,
} from 'react'

import { getHorizontalSnapKeyboardTarget } from './horizontal-snap-rail.ts'
import styles from './HorizontalSnapRail.module.css'

export interface HorizontalSnapRailProps
  extends ComponentPropsWithoutRef<'section'> {
  keyboardNavigation?: boolean
  keyboardPageRatio?: number
  resetKey?: string | number
}

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === 'function') {
    ref(value)
    return
  }

  if (ref) ref.current = value
}

export const HorizontalSnapRail = forwardRef<
  HTMLElement,
  HorizontalSnapRailProps
>(function HorizontalSnapRail(
  {
    children,
    className,
    keyboardNavigation = true,
    keyboardPageRatio = 0.8,
    onKeyDown,
    resetKey,
    tabIndex = 0,
    ...sectionProps
  },
  forwardedRef,
) {
  const viewportRef = useRef<HTMLElement | null>(null)
  const setViewportRef = useCallback(
    (node: HTMLElement | null) => {
      viewportRef.current = node
      assignRef(forwardedRef, node)
    },
    [forwardedRef],
  )

  useLayoutEffect(() => {
    if (resetKey === undefined) return
    viewportRef.current?.scrollTo({ behavior: 'auto', left: 0 })
  }, [resetKey])

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event)

    if (
      event.defaultPrevented ||
      !keyboardNavigation ||
      event.target !== event.currentTarget
    ) {
      return
    }

    const target = getHorizontalSnapKeyboardTarget({
      key: event.key,
      pageRatio: keyboardPageRatio,
      scrollLeft: event.currentTarget.scrollLeft,
      scrollWidth: event.currentTarget.scrollWidth,
      viewportWidth: event.currentTarget.clientWidth,
    })

    if (target === null) return

    event.preventDefault()
    event.currentTarget.scrollTo({ left: target })
  }

  return (
    <section
      {...sectionProps}
      className={[styles.viewport, className].filter(Boolean).join(' ')}
      onKeyDown={handleKeyDown}
      ref={setViewportRef}
      tabIndex={tabIndex}
    >
      {children}
    </section>
  )
})

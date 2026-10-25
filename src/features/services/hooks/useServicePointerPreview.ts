import { useEffect, useRef } from 'react'

import {
  getServiceKeyboardPreviewWidth,
  getServicePointerPreviewWidth,
} from './service-pointer-preview.ts'

const ACTIVE_ATTRIBUTE = 'data-preview-active'
const RESTING_ATTRIBUTE = 'data-preview-resting'
const RETURNING_ATTRIBUTE = 'data-preview-returning'
const ITEM_SELECTOR = '[data-service-preview-item]'
const SURFACE_SELECTOR = '[data-service-preview-surface]'
const ACTION_SELECTOR = '[data-service-preview-action]'
const RETURN_DURATION_MS = 260
const RESTING_DELAY_MS = 700

interface PointerPosition {
  x: number
  y: number
}

type PreviewMode = 'focus' | 'pointer'

interface PreviewGeometry {
  actionInset: number
  actionWidth: number
  baseWidth: number
  maximumWidth: number
}

export function useServicePointerPreview(disabled = false) {
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const list = listRef.current
    if (!list || disabled) return

    const finePointerQuery = window.matchMedia(
      '(hover: hover) and (pointer: fine) and (min-width: 48.0625rem)',
    )
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const cleanupTimers = new Map<HTMLElement, number>()
    let activeItem: HTMLElement | null = null
    let animationFrame: number | null = null
    let focusTimer: number | null = null
    let hintTimer: number | null = null
    let pointerPosition: PointerPosition | null = null
    let shouldResetHint = false

    const getItemParts = (item: HTMLElement) => {
      const surface = item.querySelector<HTMLElement>(SURFACE_SELECTOR)
      const action = item.querySelector<HTMLElement>(ACTION_SELECTOR)

      return surface && action ? { action, surface } : null
    }

    const clearHint = (item?: HTMLElement | null) => {
      if (hintTimer !== null) {
        window.clearTimeout(hintTimer)
        hintTimer = null
      }

      item?.removeAttribute(RESTING_ATTRIBUTE)
    }

    const restartHint = (item: HTMLElement) => {
      clearHint(item)
      if (reducedMotionQuery.matches) return

      hintTimer = window.setTimeout(() => {
        if (activeItem === item && item.dataset.previewMode === 'pointer') {
          item.setAttribute(RESTING_ATTRIBUTE, '')
        }
        hintTimer = null
      }, RESTING_DELAY_MS)
    }

    const removePreviewState = (item: HTMLElement) => {
      const cleanupTimer = cleanupTimers.get(item)
      if (cleanupTimer !== undefined) window.clearTimeout(cleanupTimer)
      cleanupTimers.delete(item)

      item.removeAttribute(ACTIVE_ATTRIBUTE)
      item.removeAttribute(RESTING_ATTRIBUTE)
      item.removeAttribute(RETURNING_ATTRIBUTE)
      delete item.dataset.previewBaseWidth
      delete item.dataset.previewMode
      item.style.removeProperty('--service-preview-width')
    }

    const deactivateItem = (item: HTMLElement, immediately = false) => {
      clearHint(item)
      if (activeItem === item) activeItem = null

      if (immediately) {
        removePreviewState(item)
        return
      }

      const baseWidth = Number(item.dataset.previewBaseWidth)
      if (!Number.isFinite(baseWidth)) {
        removePreviewState(item)
        return
      }

      item.style.setProperty('--service-preview-width', `${baseWidth}px`)
      item.setAttribute(RETURNING_ATTRIBUTE, '')

      const currentCleanupTimer = cleanupTimers.get(item)
      if (currentCleanupTimer !== undefined) window.clearTimeout(currentCleanupTimer)

      cleanupTimers.set(
        item,
        window.setTimeout(() => removePreviewState(item), RETURN_DURATION_MS),
      )
    }

    const getPreviewGeometry = (
      item: HTMLElement,
      action: HTMLElement,
      baseWidth: number,
    ): PreviewGeometry => {
      const itemWidth = item.getBoundingClientRect().width
      const actionWidth = action.getBoundingClientRect().width
      const itemStyles = window.getComputedStyle(item)
      const actionStyles = window.getComputedStyle(action)
      const inlineInset = Number.parseFloat(
        itemStyles.getPropertyValue('--services-row-inline-start'),
      )
      const actionInset = Number.parseFloat(
        actionStyles.getPropertyValue('--service-preview-action-inset'),
      )
      const safeInlineInset = Number.isFinite(inlineInset) ? inlineInset : 0

      return {
        actionInset: Number.isFinite(actionInset) ? actionInset : 0,
        actionWidth,
        baseWidth,
        maximumWidth: Math.max(baseWidth, itemWidth - safeInlineInset),
      }
    }

    const activateItem = (
      item: HTMLElement,
      mode: PreviewMode,
      getTargetWidth: (geometry: PreviewGeometry) => number,
    ) => {
      if (activeItem && activeItem !== item) deactivateItem(activeItem)

      const parts = getItemParts(item)
      if (!parts) return

      const isAlreadyActive =
        activeItem === item &&
        item.hasAttribute(ACTIVE_ATTRIBUTE) &&
        !item.hasAttribute(RETURNING_ATTRIBUTE)

      if (isAlreadyActive) {
        const baseWidth = Number(item.dataset.previewBaseWidth)
        if (!Number.isFinite(baseWidth)) return

        const geometry = getPreviewGeometry(item, parts.action, baseWidth)
        item.dataset.previewMode = mode
        item.style.setProperty(
          '--service-preview-width',
          `${getTargetWidth(geometry)}px`,
        )
        if (mode === 'focus') clearHint(item)
        return
      }

      const cleanupTimer = cleanupTimers.get(item)
      if (cleanupTimer !== undefined) {
        window.clearTimeout(cleanupTimer)
        cleanupTimers.delete(item)
      }

      const storedBaseWidth = Number(item.dataset.previewBaseWidth)
      const baseWidth = Number.isFinite(storedBaseWidth)
        ? storedBaseWidth
        : parts.surface.getBoundingClientRect().width
      const geometry = getPreviewGeometry(item, parts.action, baseWidth)

      item.dataset.previewBaseWidth = `${baseWidth}`
      item.dataset.previewMode = mode
      item.style.setProperty('--service-preview-width', `${baseWidth}px`)
      item.removeAttribute(RETURNING_ATTRIBUTE)
      item.setAttribute(ACTIVE_ATTRIBUTE, '')
      activeItem = item

      parts.surface.getBoundingClientRect()
      item.style.setProperty(
        '--service-preview-width',
        `${getTargetWidth(geometry)}px`,
      )

      clearHint(item)
    }

    const getItemUnderPointer = () => {
      if (!pointerPosition) return null

      const elementUnderPointer = document.elementFromPoint(pointerPosition.x, pointerPosition.y)
      const item = elementUnderPointer?.closest<HTMLElement>(ITEM_SELECTOR) ?? null

      return item && list.contains(item) ? item : null
    }

    const updatePointerPreview = (resetHint: boolean) => {
      animationFrame = null

      if (!finePointerQuery.matches || reducedMotionQuery.matches || !pointerPosition) {
        if (activeItem?.dataset.previewMode === 'pointer') deactivateItem(activeItem)
        return
      }

      const focusedItem = document.activeElement?.closest<HTMLElement>(ITEM_SELECTOR)
      if (focusedItem && list.contains(focusedItem) && focusedItem.matches(':focus-within')) return

      const item = getItemUnderPointer()
      if (!item) {
        if (activeItem?.dataset.previewMode === 'pointer') deactivateItem(activeItem)
        return
      }

      const itemRect = item.getBoundingClientRect()
      const wasActive = activeItem === item
      activateItem(item, 'pointer', (geometry) =>
        getServicePointerPreviewWidth({
          ...geometry,
          pointerOffsetX: pointerPosition!.x - itemRect.left,
        }),
      )

      if (resetHint || !wasActive) restartHint(item)
    }

    const schedulePointerPreview = (resetHint = false) => {
      shouldResetHint ||= resetHint
      if (animationFrame !== null) return
      animationFrame = window.requestAnimationFrame(() => {
        const resetPendingHint = shouldResetHint
        shouldResetHint = false
        updatePointerPreview(resetPendingHint)
      })
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      pointerPosition = { x: event.clientX, y: event.clientY }
      schedulePointerPreview(true)
    }

    const handleScroll = () => schedulePointerPreview()

    const handleFocusIn = (event: FocusEvent) => {
      const item = (event.target as Element | null)?.closest<HTMLElement>(ITEM_SELECTOR)
      if (!item || !list.contains(item)) return

      activateItem(item, 'focus', (geometry) =>
        getServiceKeyboardPreviewWidth(
          geometry.baseWidth,
          geometry.maximumWidth,
          geometry.actionWidth,
          geometry.actionInset,
        ),
      )
    }

    const handleFocusOut = () => {
      if (focusTimer !== null) window.clearTimeout(focusTimer)
      focusTimer = window.setTimeout(() => {
        focusTimer = null
        const focusedItem = document.activeElement?.closest<HTMLElement>(ITEM_SELECTOR)
        if (focusedItem && list.contains(focusedItem)) return

        if (activeItem?.dataset.previewMode === 'focus') deactivateItem(activeItem)
        schedulePointerPreview()
      })
    }

    const resetPreview = () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame)
        animationFrame = null
      }
      shouldResetHint = false

      if (activeItem) deactivateItem(activeItem, true)
      list.querySelectorAll<HTMLElement>(ITEM_SELECTOR).forEach(removePreviewState)
      schedulePointerPreview()
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', resetPreview, { passive: true })
    list.addEventListener('focusin', handleFocusIn)
    list.addEventListener('focusout', handleFocusOut)
    finePointerQuery.addEventListener('change', resetPreview)
    reducedMotionQuery.addEventListener('change', resetPreview)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', resetPreview)
      list.removeEventListener('focusin', handleFocusIn)
      list.removeEventListener('focusout', handleFocusOut)
      finePointerQuery.removeEventListener('change', resetPreview)
      reducedMotionQuery.removeEventListener('change', resetPreview)
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
      if (focusTimer !== null) window.clearTimeout(focusTimer)
      if (hintTimer !== null) window.clearTimeout(hintTimer)
      cleanupTimers.forEach((timer) => window.clearTimeout(timer))
      list.querySelectorAll<HTMLElement>(ITEM_SELECTOR).forEach(removePreviewState)
    }
  }, [disabled])

  return listRef
}

import { useEffect, useRef } from 'react'

interface PointerPosition {
  x: number
  y: number
}

export function useScrollAwareServiceHover(
  onActiveServiceChange: (serviceId: string | null) => void,
) {
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    let animationFrame: number | null = null
    let pointerPosition: PointerPosition | null = null

    const rememberPointerPosition = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      pointerPosition = { x: event.clientX, y: event.clientY }
    }

    const updateServiceUnderPointer = () => {
      animationFrame = null

      const list = listRef.current
      if (!list || !finePointerQuery.matches || !pointerPosition) return

      const elementUnderPointer = document.elementFromPoint(pointerPosition.x, pointerPosition.y)
      const serviceTrigger = elementUnderPointer?.closest<HTMLElement>('[data-service-id]')

      if (serviceTrigger && list.contains(serviceTrigger)) {
        onActiveServiceChange(serviceTrigger.dataset.serviceId ?? null)
        return
      }

      if (!list.contains(document.activeElement)) onActiveServiceChange(null)
    }

    const scheduleHoverUpdate = () => {
      if (animationFrame !== null) return
      animationFrame = window.requestAnimationFrame(updateServiceUnderPointer)
    }

    window.addEventListener('pointermove', rememberPointerPosition, { passive: true })
    window.addEventListener('scroll', scheduleHoverUpdate, { passive: true })

    return () => {
      window.removeEventListener('pointermove', rememberPointerPosition)
      window.removeEventListener('scroll', scheduleHoverUpdate)
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
    }
  }, [onActiveServiceChange])

  return listRef
}

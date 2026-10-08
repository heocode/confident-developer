import { useCallback, useEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

interface Offset {
  x: number
  y: number
}

const INITIAL_OFFSET: Offset = { x: 0, y: 0 }
const ESCAPE_ANGLES = [0, Math.PI / 2.5, -Math.PI / 2.5, Math.PI / 1.25, -Math.PI / 1.25]

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

export function useEscapingPortrait() {
  const heroRef = useRef<HTMLElement>(null)
  const portraitRef = useRef<HTMLDivElement>(null)
  const baseRect = useRef<DOMRect | null>(null)
  const offset = useRef<Offset>(INITIAL_OFFSET)

  const applyOffset = useCallback((nextOffset: Offset) => {
    const portrait = portraitRef.current
    if (!portrait) return

    offset.current = nextOffset
    portrait.style.setProperty('--portrait-x', `${nextOffset.x}px`)
    portrait.style.setProperty('--portrait-y', `${nextOffset.y}px`)
  }, [])

  const resetPosition = useCallback(() => {
    applyOffset(INITIAL_OFFSET)
  }, [applyOffset])

  useEffect(() => {
    const handleResize = () => {
      resetPosition()
      baseRect.current = null
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [resetPosition])

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const hero = heroRef.current
    const portrait = portraitRef.current
    if (!hero || !portrait) return

    const portraitRect = portrait.getBoundingClientRect()
    const currentCenter = {
      x: portraitRect.left + portraitRect.width / 2,
      y: portraitRect.top + portraitRect.height / 2,
    }
    const pointerDelta = {
      x: currentCenter.x - event.clientX,
      y: currentCenter.y - event.clientY,
    }
    const pointerDistance = Math.hypot(pointerDelta.x, pointerDelta.y)
    const activationRadius = Math.max(150, portraitRect.width * 0.82)

    if (pointerDistance >= activationRadius) return

    if (!baseRect.current) baseRect.current = portraitRect

    const direction =
      pointerDistance > 0
        ? { x: pointerDelta.x / pointerDistance, y: pointerDelta.y / pointerDistance }
        : { x: -1, y: 0 }
    const escapeDistance = activationRadius - pointerDistance + Math.max(64, portraitRect.width * 0.3)
    const heroRect = hero.getBoundingClientRect()
    const origin = baseRect.current
    const horizontalRange = Math.min(280, heroRect.width * 0.22)
    const verticalRange = Math.min(190, heroRect.height * 0.18)
    const bounds = {
      minimumX: Math.max(-horizontalRange, heroRect.left + 20 - origin.left),
      maximumX: Math.min(horizontalRange, heroRect.right - 20 - origin.right),
      minimumY: Math.max(-verticalRange, heroRect.top + 20 - origin.top),
      maximumY: Math.min(verticalRange, heroRect.bottom - 20 - origin.bottom),
    }

    const candidates = ESCAPE_ANGLES.map((angle) => {
      const cosine = Math.cos(angle)
      const sine = Math.sin(angle)
      const rotatedDirection = {
        x: direction.x * cosine - direction.y * sine,
        y: direction.x * sine + direction.y * cosine,
      }

      return {
        x: clamp(offset.current.x + rotatedDirection.x * escapeDistance, bounds.minimumX, bounds.maximumX),
        y: clamp(offset.current.y + rotatedDirection.y * escapeDistance, bounds.minimumY, bounds.maximumY),
      }
    })

    const baseCenter = {
      x: origin.left + origin.width / 2,
      y: origin.top + origin.height / 2,
    }
    const safestOffset = candidates.reduce((safest, candidate) => {
      const candidateDistance = Math.hypot(
        baseCenter.x + candidate.x - event.clientX,
        baseCenter.y + candidate.y - event.clientY,
      )
      const safestDistance = Math.hypot(
        baseCenter.x + safest.x - event.clientX,
        baseCenter.y + safest.y - event.clientY,
      )

      return candidateDistance > safestDistance ? candidate : safest
    })

    applyOffset(safestOffset)
  }

  return {
    heroRef,
    portraitRef,
    handlePointerMove,
    handlePointerLeave: resetPosition,
  }
}

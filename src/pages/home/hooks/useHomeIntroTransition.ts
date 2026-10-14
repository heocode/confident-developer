import { useLayoutEffect, useRef } from 'react'

import { getHomeIntroTransitionState } from '../utils/home-intro-transition.ts'

const CARD_INITIAL_OFFSET_SVH = 13
const MOTION_ATTRIBUTE = 'data-home-intro-motion'

function removeMotionStyles(element: HTMLDivElement) {
  element.removeAttribute(MOTION_ATTRIBUTE)
  element.style.removeProperty('--home-hero-opacity')
  element.style.removeProperty('--home-projects-title-opacity')
  element.style.removeProperty('--home-projects-content-opacity')
  element.style.removeProperty('--home-projects-content-offset')

  for (let index = 1; index <= 3; index += 1) {
    element.style.removeProperty(`--home-project-card-${index}-opacity`)
    element.style.removeProperty(`--home-project-card-${index}-offset`)
  }
}

export function useHomeIntroTransition() {
  const sequenceRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const sequence = sequenceRef.current
    if (!sequence) return

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animationFrame: number | null = null
    let previousProgress = -1

    const updateTransition = () => {
      animationFrame = null

      if (reducedMotionQuery.matches) {
        previousProgress = -1
        removeMotionStyles(sequence)
        return
      }

      const scrollDistance = -sequence.getBoundingClientRect().top
      const transition = getHomeIntroTransitionState(scrollDistance, window.innerHeight)

      if (Math.abs(transition.progress - previousProgress) < 0.001) return
      previousProgress = transition.progress

      sequence.style.setProperty('--home-hero-opacity', transition.heroOpacity.toFixed(4))
      sequence.style.setProperty('--home-projects-title-opacity', transition.projectsTitleProgress.toFixed(4))

      const contentProgress = transition.projectCardProgresses[0]
      sequence.style.setProperty('--home-projects-content-opacity', contentProgress.toFixed(4))
      sequence.style.setProperty(
        '--home-projects-content-offset',
        `${((1 - contentProgress) * CARD_INITIAL_OFFSET_SVH).toFixed(3)}svh`,
      )

      transition.projectCardProgresses.forEach((cardProgress, index) => {
        const cardNumber = index + 1
        sequence.style.setProperty(`--home-project-card-${cardNumber}-opacity`, cardProgress.toFixed(4))
        sequence.style.setProperty(
          `--home-project-card-${cardNumber}-offset`,
          `${((1 - cardProgress) * CARD_INITIAL_OFFSET_SVH).toFixed(3)}svh`,
        )
      })

      sequence.setAttribute(MOTION_ATTRIBUTE, '')
    }

    const scheduleTransitionUpdate = () => {
      if (animationFrame !== null) return
      animationFrame = window.requestAnimationFrame(updateTransition)
    }

    const handleMotionPreferenceChange = () => {
      previousProgress = -1
      scheduleTransitionUpdate()
    }

    updateTransition()
    window.addEventListener('scroll', scheduleTransitionUpdate, { passive: true })
    window.addEventListener('resize', scheduleTransitionUpdate)
    reducedMotionQuery.addEventListener('change', handleMotionPreferenceChange)

    return () => {
      window.removeEventListener('scroll', scheduleTransitionUpdate)
      window.removeEventListener('resize', scheduleTransitionUpdate)
      reducedMotionQuery.removeEventListener('change', handleMotionPreferenceChange)
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
      removeMotionStyles(sequence)
    }
  }, [])

  return sequenceRef
}

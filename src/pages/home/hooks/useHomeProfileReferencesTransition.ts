import { useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'

import { getProfileReferencesTransitionState } from '../utils/profile-references-transition.ts'

const PROFILE_EXIT_OFFSET_SVH = 10
const REFERENCES_PANEL_INITIAL_OFFSET_SVH = 13
const REFERENCES_TITLE_INITIAL_OFFSET_SVH = 4
const REFERENCES_MOTION_ATTRIBUTE = 'data-home-references-motion'

function removeMotionStyles(
  profileSection: HTMLElement,
  referencesSection: HTMLElement,
) {
  profileSection.style.removeProperty('--home-profile-exit-opacity')
  profileSection.style.removeProperty('--home-profile-exit-offset')
  referencesSection.removeAttribute(REFERENCES_MOTION_ATTRIBUTE)
  referencesSection.style.removeProperty('--home-references-title-opacity')
  referencesSection.style.removeProperty('--home-references-title-offset')
  referencesSection.style.removeProperty('--home-references-panel-opacity')
  referencesSection.style.removeProperty('--home-references-panel-offset')
}

export function useHomeProfileReferencesTransition(
  profileSectionRef: RefObject<HTMLElement | null>,
) {
  const referencesSectionRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const profileSection = profileSectionRef.current
    const referencesSection = referencesSectionRef.current
    if (!profileSection || !referencesSection) return

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animationFrame: number | null = null
    let previousProgress = -1

    const updateTransition = () => {
      animationFrame = null

      if (reducedMotionQuery.matches) {
        previousProgress = -1
        removeMotionStyles(profileSection, referencesSection)
        return
      }

      const transition = getProfileReferencesTransitionState(
        referencesSection.getBoundingClientRect().top,
        window.innerHeight,
      )

      if (Math.abs(transition.progress - previousProgress) < 0.001) return
      previousProgress = transition.progress

      profileSection.style.setProperty(
        '--home-profile-exit-opacity',
        transition.profileContentProgress.toFixed(4),
      )
      profileSection.style.setProperty(
        '--home-profile-exit-offset',
        `${(-(1 - transition.profileContentProgress) * PROFILE_EXIT_OFFSET_SVH).toFixed(3)}svh`,
      )
      referencesSection.style.setProperty(
        '--home-references-title-opacity',
        transition.referencesTitleProgress.toFixed(4),
      )
      referencesSection.style.setProperty(
        '--home-references-title-offset',
        `${((1 - transition.referencesTitleProgress) * REFERENCES_TITLE_INITIAL_OFFSET_SVH).toFixed(3)}svh`,
      )
      referencesSection.style.setProperty(
        '--home-references-panel-opacity',
        transition.referencesPanelProgress.toFixed(4),
      )
      referencesSection.style.setProperty(
        '--home-references-panel-offset',
        `${((1 - transition.referencesPanelProgress) * REFERENCES_PANEL_INITIAL_OFFSET_SVH).toFixed(3)}svh`,
      )
      referencesSection.setAttribute(REFERENCES_MOTION_ATTRIBUTE, '')
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
      removeMotionStyles(profileSection, referencesSection)
    }
  }, [profileSectionRef])

  return referencesSectionRef
}

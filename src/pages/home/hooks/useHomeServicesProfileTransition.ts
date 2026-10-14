import { useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'

import { getServicesProfileTransitionState } from '../utils/services-profile-transition.ts'

const SERVICES_EXIT_OFFSET_SVH = 10
const PROFILE_CARD_INITIAL_OFFSET_SVH = 13
const PROFILE_TITLE_INITIAL_OFFSET_SVH = 4
const PROFILE_MOTION_ATTRIBUTE = 'data-home-profile-motion'

function removeMotionStyles(servicesSection: HTMLElement, profileSection: HTMLElement) {
  servicesSection.style.removeProperty('--home-services-exit-opacity')
  servicesSection.style.removeProperty('--home-services-exit-offset')
  profileSection.removeAttribute(PROFILE_MOTION_ATTRIBUTE)
  profileSection.style.removeProperty('--home-profile-title-opacity')
  profileSection.style.removeProperty('--home-profile-title-offset')
  profileSection.style.removeProperty('--home-profile-card-opacity')
  profileSection.style.removeProperty('--home-profile-card-offset')
}

export function useHomeServicesProfileTransition(
  servicesSectionRef: RefObject<HTMLElement | null>,
) {
  const profileSectionRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const servicesSection = servicesSectionRef.current
    const profileSection = profileSectionRef.current
    if (!servicesSection || !profileSection) return

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animationFrame: number | null = null
    let previousProgress = -1

    const updateTransition = () => {
      animationFrame = null

      if (reducedMotionQuery.matches) {
        previousProgress = -1
        removeMotionStyles(servicesSection, profileSection)
        return
      }

      const transition = getServicesProfileTransitionState(
        profileSection.getBoundingClientRect().top,
        window.innerHeight,
      )

      if (Math.abs(transition.progress - previousProgress) < 0.001) return
      previousProgress = transition.progress

      servicesSection.style.setProperty(
        '--home-services-exit-opacity',
        transition.servicesContentProgress.toFixed(4),
      )
      servicesSection.style.setProperty(
        '--home-services-exit-offset',
        `${(-(1 - transition.servicesContentProgress) * SERVICES_EXIT_OFFSET_SVH).toFixed(3)}svh`,
      )
      profileSection.style.setProperty(
        '--home-profile-title-opacity',
        transition.profileTitleProgress.toFixed(4),
      )
      profileSection.style.setProperty(
        '--home-profile-title-offset',
        `${((1 - transition.profileTitleProgress) * PROFILE_TITLE_INITIAL_OFFSET_SVH).toFixed(3)}svh`,
      )
      profileSection.style.setProperty(
        '--home-profile-card-opacity',
        transition.profileCardProgress.toFixed(4),
      )
      profileSection.style.setProperty(
        '--home-profile-card-offset',
        `${((1 - transition.profileCardProgress) * PROFILE_CARD_INITIAL_OFFSET_SVH).toFixed(3)}svh`,
      )
      profileSection.setAttribute(PROFILE_MOTION_ATTRIBUTE, '')
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
      removeMotionStyles(servicesSection, profileSection)
    }
  }, [servicesSectionRef])

  return profileSectionRef
}

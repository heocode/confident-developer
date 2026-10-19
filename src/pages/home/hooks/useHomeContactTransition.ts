import { useLayoutEffect, useRef } from 'react'

import { getContactTransitionState } from '../utils/contact-transition.ts'

const CONTACT_BOTTOM_INITIAL_OFFSET_SVH = 18
const CONTACT_BUTTON_INITIAL_OFFSET_SVH = 8
const CONTACT_TITLE_INITIAL_OFFSET_SVH = 4
const CONTACT_MOTION_ATTRIBUTE = 'data-home-contact-motion'

function removeMotionStyles(contactSection: HTMLElement) {
  contactSection.removeAttribute(CONTACT_MOTION_ATTRIBUTE)
  contactSection.style.removeProperty('--home-contact-title-opacity')
  contactSection.style.removeProperty('--home-contact-title-offset')
  contactSection.style.removeProperty('--home-contact-button-opacity')
  contactSection.style.removeProperty('--home-contact-button-offset')
  contactSection.style.removeProperty('--home-contact-bottom-opacity')
  contactSection.style.removeProperty('--home-contact-bottom-offset')
}

export function useHomeContactTransition() {
  const contactSectionRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const contactSection = contactSectionRef.current
    if (!contactSection) return

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animationFrame: number | null = null
    let previousProgress = -1

    const updateTransition = () => {
      animationFrame = null

      if (reducedMotionQuery.matches) {
        previousProgress = -1
        removeMotionStyles(contactSection)
        return
      }

      const transition = getContactTransitionState(
        contactSection.getBoundingClientRect().top,
        window.innerHeight,
      )

      if (Math.abs(transition.progress - previousProgress) < 0.001) return
      previousProgress = transition.progress

      contactSection.style.setProperty(
        '--home-contact-title-opacity',
        transition.titleProgress.toFixed(4),
      )
      contactSection.style.setProperty(
        '--home-contact-title-offset',
        `${((1 - transition.titleProgress) * CONTACT_TITLE_INITIAL_OFFSET_SVH).toFixed(3)}svh`,
      )
      contactSection.style.setProperty(
        '--home-contact-button-opacity',
        transition.buttonProgress.toFixed(4),
      )
      contactSection.style.setProperty(
        '--home-contact-button-offset',
        `${((1 - transition.buttonProgress) * CONTACT_BUTTON_INITIAL_OFFSET_SVH).toFixed(3)}svh`,
      )
      contactSection.style.setProperty(
        '--home-contact-bottom-opacity',
        transition.bottomProgress.toFixed(4),
      )
      contactSection.style.setProperty(
        '--home-contact-bottom-offset',
        `${((1 - transition.bottomProgress) * CONTACT_BOTTOM_INITIAL_OFFSET_SVH).toFixed(3)}svh`,
      )
      contactSection.setAttribute(CONTACT_MOTION_ATTRIBUTE, '')
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
      removeMotionStyles(contactSection)
    }
  }, [])

  return contactSectionRef
}

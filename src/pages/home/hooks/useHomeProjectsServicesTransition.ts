import { useLayoutEffect, useRef } from 'react'

import { getProjectsServicesTransitionState } from '../utils/projects-services-transition.ts'

const PROJECTS_EXIT_OFFSET_SVH = 10
const SERVICE_ITEM_INITIAL_OFFSET_SVH = 13
const SERVICES_TITLE_INITIAL_OFFSET_SVH = 4
const SERVICES_MOTION_ATTRIBUTE = 'data-home-services-motion'
const SERVICE_ITEM_SELECTOR = '[data-home-service-entrance-item]'

function removeMotionStyles(
  projectsSection: HTMLElement,
  servicesSection: HTMLElement,
  serviceItems: readonly HTMLElement[],
) {
  projectsSection.style.removeProperty('--home-projects-exit-opacity')
  projectsSection.style.removeProperty('--home-projects-exit-offset')
  servicesSection.removeAttribute(SERVICES_MOTION_ATTRIBUTE)
  servicesSection.style.removeProperty('--home-services-title-opacity')
  servicesSection.style.removeProperty('--home-services-title-offset')

  serviceItems.forEach((item) => {
    item.style.removeProperty('--home-service-item-opacity')
    item.style.removeProperty('--home-service-item-offset')
  })
}

export function useHomeProjectsServicesTransition() {
  const projectsSectionRef = useRef<HTMLElement>(null)
  const servicesSectionRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const projectsSection = projectsSectionRef.current
    const servicesSection = servicesSectionRef.current
    if (!projectsSection || !servicesSection) return

    let serviceItems = Array.from(
      servicesSection.querySelectorAll<HTMLElement>(SERVICE_ITEM_SELECTOR),
    )
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animationFrame: number | null = null
    let previousProgress = -1

    const updateTransition = () => {
      animationFrame = null

      if (reducedMotionQuery.matches) {
        previousProgress = -1
        removeMotionStyles(projectsSection, servicesSection, serviceItems)
        return
      }

      const transition = getProjectsServicesTransitionState(
        servicesSection.getBoundingClientRect().top,
        window.innerHeight,
        serviceItems.length,
      )

      if (Math.abs(transition.progress - previousProgress) < 0.001) return
      previousProgress = transition.progress

      projectsSection.style.setProperty(
        '--home-projects-exit-opacity',
        transition.projectsContentProgress.toFixed(4),
      )
      projectsSection.style.setProperty(
        '--home-projects-exit-offset',
        `${(-(1 - transition.projectsContentProgress) * PROJECTS_EXIT_OFFSET_SVH).toFixed(3)}svh`,
      )
      servicesSection.style.setProperty(
        '--home-services-title-opacity',
        transition.servicesTitleProgress.toFixed(4),
      )
      servicesSection.style.setProperty(
        '--home-services-title-offset',
        `${((1 - transition.servicesTitleProgress) * SERVICES_TITLE_INITIAL_OFFSET_SVH).toFixed(3)}svh`,
      )

      transition.serviceItemProgresses.forEach((itemProgress, index) => {
        const item = serviceItems[index]
        if (!item) return

        item.style.setProperty('--home-service-item-opacity', itemProgress.toFixed(4))
        item.style.setProperty(
          '--home-service-item-offset',
          `${((1 - itemProgress) * SERVICE_ITEM_INITIAL_OFFSET_SVH).toFixed(3)}svh`,
        )
      })

      servicesSection.setAttribute(SERVICES_MOTION_ATTRIBUTE, '')
    }

    const scheduleTransitionUpdate = () => {
      if (animationFrame !== null) return
      animationFrame = window.requestAnimationFrame(updateTransition)
    }

    const handleMotionPreferenceChange = () => {
      previousProgress = -1
      scheduleTransitionUpdate()
    }

    const serviceItemsObserver = new MutationObserver(() => {
      serviceItems = Array.from(
        servicesSection.querySelectorAll<HTMLElement>(SERVICE_ITEM_SELECTOR),
      )
      previousProgress = -1
      scheduleTransitionUpdate()
    })

    updateTransition()
    serviceItemsObserver.observe(servicesSection, { childList: true, subtree: true })
    window.addEventListener('scroll', scheduleTransitionUpdate, { passive: true })
    window.addEventListener('resize', scheduleTransitionUpdate)
    reducedMotionQuery.addEventListener('change', handleMotionPreferenceChange)

    return () => {
      window.removeEventListener('scroll', scheduleTransitionUpdate)
      window.removeEventListener('resize', scheduleTransitionUpdate)
      reducedMotionQuery.removeEventListener('change', handleMotionPreferenceChange)
      serviceItemsObserver.disconnect()
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
      removeMotionStyles(projectsSection, servicesSection, serviceItems)
    }
  }, [])

  return { projectsSectionRef, servicesSectionRef }
}

import { useEffect, useState } from 'react'

import arrowUrl from '../../../assets/icons/actions/arrow.svg'
import styles from './ScrollToTopButton.module.css'

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let animationFrame: number | null = null

    const updateVisibility = () => {
      setIsVisible(window.scrollY >= window.innerHeight * 0.65)
      animationFrame = null
    }

    const scheduleVisibilityUpdate = () => {
      if (animationFrame !== null) return
      animationFrame = window.requestAnimationFrame(updateVisibility)
    }

    updateVisibility()
    window.addEventListener('scroll', scheduleVisibilityUpdate, { passive: true })
    window.addEventListener('resize', scheduleVisibilityUpdate)

    return () => {
      window.removeEventListener('scroll', scheduleVisibilityUpdate)
      window.removeEventListener('resize', scheduleVisibilityUpdate)
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
    }
  }, [])

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  if (!isVisible) return null

  return (
    <button className={styles.button} type="button" onClick={scrollToTop} aria-label="Scroll to top">
      <img src={arrowUrl} alt="" />
    </button>
  )
}

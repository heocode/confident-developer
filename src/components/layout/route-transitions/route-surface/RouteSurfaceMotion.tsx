import type { AnimationEvent, ReactNode } from 'react'

import type { PrimaryRouteMotionSnapshot } from '../usePrimaryRouteMotion.ts'
import styles from './RouteSurfaceMotion.module.css'

interface RouteSurfaceMotionProps {
  children: ReactNode
  motion: PrimaryRouteMotionSnapshot & { complete: () => void }
}

export function RouteSurfaceMotion({ children, motion }: RouteSurfaceMotionProps) {
  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.currentTarget !== event.target || motion.phase === 'idle') return

    const completionAnimation = motion.phase === 'entering'
      ? styles['surface-shape-enter']
      : styles['surface-shape-leave']

    if (event.animationName === completionAnimation) motion.complete()
  }

  return (
    <div
      className={styles.surface}
      data-route-motion-direction={motion.direction ?? undefined}
      data-route-motion-phase={motion.phase}
      onAnimationEnd={handleAnimationEnd}
    >
      {children}
    </div>
  )
}

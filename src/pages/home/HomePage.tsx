import { HomeProjectsSection } from '../../features/projects/components/HomeProjectsSection'
import { useHomeIntroTransition } from './hooks/useHomeIntroTransition'
import { HeroSection } from './sections/HeroSection'

export function HomePage() {
  const transitionRef = useHomeIntroTransition()

  return (
    <div ref={transitionRef}>
      <HeroSection />
      <HomeProjectsSection />
    </div>
  )
}

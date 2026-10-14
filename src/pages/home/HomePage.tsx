import { HomeProjectsSection } from '../../features/projects/components/HomeProjectsSection'
import { HomeServicesSection } from '../../features/services/components/HomeServicesSection'
import { ScrollToTopButton } from './components/ScrollToTopButton'
import { useHomeIntroTransition } from './hooks/useHomeIntroTransition'
import { HeroSection } from './sections/HeroSection'

export function HomePage() {
  const transitionRef = useHomeIntroTransition()

  return (
    <div ref={transitionRef}>
      <HeroSection />
      <HomeProjectsSection />
      <HomeServicesSection />
      <ScrollToTopButton />
    </div>
  )
}

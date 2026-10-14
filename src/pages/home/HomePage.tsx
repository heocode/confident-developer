import { HomeProjectsSection } from '../../features/projects/components/HomeProjectsSection'
import { HomeServicesSection } from '../../features/services/components/HomeServicesSection'
import { ScrollToTopButton } from './components/ScrollToTopButton'
import { useHomeIntroTransition } from './hooks/useHomeIntroTransition'
import { useHomeProjectsServicesTransition } from './hooks/useHomeProjectsServicesTransition.ts'
import { HeroSection } from './sections/HeroSection'
import { homeServices } from '../../data/home-services.ts'

export function HomePage() {
  const transitionRef = useHomeIntroTransition()
  const { projectsSectionRef, servicesSectionRef } = useHomeProjectsServicesTransition(
    homeServices.length,
  )

  return (
    <div ref={transitionRef}>
      <HeroSection />
      <HomeProjectsSection sectionRef={projectsSectionRef} />
      <HomeServicesSection sectionRef={servicesSectionRef} />
      <ScrollToTopButton />
    </div>
  )
}

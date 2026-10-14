import { HomeProjectsSection } from '../../features/projects/components/HomeProjectsSection'
import { HomeProfileSection } from '../../features/profile/components/HomeProfileSection.tsx'
import { HomeServicesSection } from '../../features/services/components/HomeServicesSection'
import { ScrollToTopButton } from './components/ScrollToTopButton'
import { useHomeIntroTransition } from './hooks/useHomeIntroTransition'
import { useHomeProjectsServicesTransition } from './hooks/useHomeProjectsServicesTransition.ts'
import { HeroSection } from './sections/HeroSection'

export function HomePage() {
  const transitionRef = useHomeIntroTransition()
  const { projectsSectionRef, servicesSectionRef } = useHomeProjectsServicesTransition()

  return (
    <div ref={transitionRef}>
      <HeroSection />
      <HomeProjectsSection sectionRef={projectsSectionRef} />
      <HomeServicesSection sectionRef={servicesSectionRef} />
      <HomeProfileSection />
      <ScrollToTopButton />
    </div>
  )
}

import { HomeProjectsSection } from '../../features/projects/components/HomeProjectsSection'
import { HomeProfileSection } from '../../features/profile/components/HomeProfileSection.tsx'
import { HomeServicesSection } from '../../features/services/components/HomeServicesSection'
import { HomeReferencesSection } from '../../features/references/components/HomeReferencesSection.tsx'
import { ScrollToTopButton } from './components/ScrollToTopButton'
import { useHomeIntroTransition } from './hooks/useHomeIntroTransition'
import { useHomeProjectsServicesTransition } from './hooks/useHomeProjectsServicesTransition.ts'
import { useHomeProfileReferencesTransition } from './hooks/useHomeProfileReferencesTransition.ts'
import { useHomeServicesProfileTransition } from './hooks/useHomeServicesProfileTransition.ts'
import { HeroSection } from './sections/HeroSection'

export function HomePage() {
  const transitionRef = useHomeIntroTransition()
  const { projectsSectionRef, servicesSectionRef } = useHomeProjectsServicesTransition()
  const profileSectionRef = useHomeServicesProfileTransition(servicesSectionRef)
  const referencesSectionRef = useHomeProfileReferencesTransition(profileSectionRef)

  return (
    <div ref={transitionRef}>
      <HeroSection />
      <HomeProjectsSection sectionRef={projectsSectionRef} />
      <HomeServicesSection sectionRef={servicesSectionRef} />
      <HomeProfileSection sectionRef={profileSectionRef} />
      <HomeReferencesSection sectionRef={referencesSectionRef} />
      <ScrollToTopButton />
    </div>
  )
}

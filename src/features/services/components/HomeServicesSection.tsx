import type { Ref } from 'react'

import { homeServices } from '../../../data/home-services.ts'
import styles from './HomeServicesSection.module.css'
import { ServiceAccordion } from './ServiceAccordion.tsx'

interface HomeServicesSectionProps {
  sectionRef?: Ref<HTMLElement>
}

export function HomeServicesSection({ sectionRef }: HomeServicesSectionProps) {
  return (
    <section
      className={styles.section}
      id="home-services"
      aria-labelledby="home-services-title"
      ref={sectionRef}
    >
      <header className={styles.header}>
        <h2 id="home-services-title">HOW I BUILD STUFF</h2>
      </header>

      <ServiceAccordion services={homeServices} />
    </section>
  )
}

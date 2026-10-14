import { homeServices } from '../../../data/home-services.ts'
import styles from './HomeServicesSection.module.css'
import { ServiceAccordion } from './ServiceAccordion.tsx'

export function HomeServicesSection() {
  return (
    <section className={styles.section} id="home-services" aria-labelledby="home-services-title">
      <header className={styles.header}>
        <h2 id="home-services-title">HOW I BUILD STUFF</h2>
      </header>

      <ServiceAccordion services={homeServices} />
    </section>
  )
}

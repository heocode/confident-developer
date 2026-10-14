import type { Ref } from 'react'

import { useHomeServices } from '../hooks/useHomeServices.ts'
import styles from './HomeServicesSection.module.css'
import { ServiceAccordion } from './ServiceAccordion.tsx'

interface HomeServicesSectionProps {
  sectionRef?: Ref<HTMLElement>
}

export function HomeServicesSection({ sectionRef }: HomeServicesSectionProps) {
  const { retry, state } = useHomeServices()

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

      {state.status === 'loading' && (
        <div
          className={styles.state}
          data-home-service-entrance-item=""
          role="status"
          aria-live="polite"
        >
          <p>Loading services…</p>
        </div>
      )}

      {state.status === 'empty' && (
        <div className={styles.state} data-home-service-entrance-item="">
          <h3>No featured services yet</h3>
          <p>Featured services will appear here when they become available.</p>
        </div>
      )}

      {state.status === 'error' && (
        <div className={styles.state} data-home-service-entrance-item="" role="alert">
          <h3>Services are unavailable</h3>
          <p>{state.message}</p>
          <button type="button" onClick={retry}>
            Try again
          </button>
        </div>
      )}

      {state.status === 'ready' && <ServiceAccordion services={state.services} />}
    </section>
  )
}

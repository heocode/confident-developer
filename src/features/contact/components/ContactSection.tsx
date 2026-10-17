import { useState } from 'react'
import type { Ref } from 'react'

import contactLandscape from '../../../assets/images/decorations/contact-landscape.webp'
import { SocialLinks } from '../../../components/social/SocialLinks.tsx'
import { siteIdentity, siteSocialLinks } from '../../../data/site.ts'
import { ContactDrawer } from './ContactDrawer.tsx'
import styles from './ContactSection.module.css'

interface ContactSectionProps {
  headingLevel: 'h1' | 'h2'
  id: string
  initiallyOpen?: boolean
  sectionRef?: Ref<HTMLElement>
}

export function ContactSection({
  headingLevel,
  id,
  initiallyOpen = false,
  sectionRef,
}: ContactSectionProps) {
  const [drawerSession, setDrawerSession] = useState(0)
  const [isDrawerOpen, setIsDrawerOpen] = useState(initiallyOpen)
  const Heading = headingLevel
  const titleId = `${id}-title`

  function openDrawer() {
    setDrawerSession((session) => session + 1)
    setIsDrawerOpen(true)
  }

  return (
    <section className={styles.section} id={id} aria-labelledby={titleId} ref={sectionRef}>
      <div className={styles.callToAction}>
        <Heading id={titleId}>WANNA BUILD STUFF?</Heading>
        <button type="button" onClick={openDrawer}>
          HIT ME UP
        </button>
      </div>

      <img
        className={styles.landscape}
        src={contactLandscape}
        alt=""
        aria-hidden="true"
        width="2880"
        height="758"
      />

      <footer className={styles.footer}>
        <SocialLinks className={styles.socials} links={siteSocialLinks} />
        <p>
          {siteIdentity.firstName} {siteIdentity.lastName} © {new Date().getFullYear()}
        </p>
      </footer>

      <ContactDrawer
        key={drawerSession}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </section>
  )
}

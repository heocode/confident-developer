import { useState } from 'react'

import contactLandscape from '../../../assets/images/decorations/contact-landscape.webp'
import { ContactDrawer } from '../components/ContactDrawer.tsx'
import styles from './ContactRoute.module.css'

export function ContactRoute() {
  const [drawerSession, setDrawerSession] = useState(0)
  const [isDrawerOpen, setIsDrawerOpen] = useState(true)

  function closeDrawer() {
    setIsDrawerOpen(false)
  }

  function openDrawer() {
    setDrawerSession((session) => session + 1)
    setIsDrawerOpen(true)
  }

  return (
    <section className={styles.page} aria-labelledby="contact-page-title">
      <div className={styles.content}>
        <h1 id="contact-page-title">WANNA BUILD STUFF?</h1>
        <button type="button" onClick={openDrawer}>
          HIT ME UP
        </button>
      </div>
      <img className={styles.landscape} src={contactLandscape} alt="" aria-hidden="true" />

      <ContactDrawer key={drawerSession} isOpen={isDrawerOpen} onClose={closeDrawer} />
    </section>
  )
}

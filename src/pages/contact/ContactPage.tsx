import { ContactForm } from '../../features/contact/components/ContactForm.tsx'
import styles from './ContactPage.module.css'

export function ContactPage() {
  return (
    <section className={styles.page} aria-labelledby="contact-page-title">
      <h1 id="contact-page-title">WANNA BUILD STUFF?</h1>
      <div className={styles.panel}>
        <ContactForm layout="panel" titleId="contact-page-form-title" />
      </div>
    </section>
  )
}

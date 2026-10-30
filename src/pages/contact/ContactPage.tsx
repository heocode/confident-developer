import { RouteSurfaceMotion } from '../../components/layout/route-transitions/route-surface/RouteSurfaceMotion.tsx'
import { usePrimaryRouteMotion } from '../../components/layout/route-transitions/usePrimaryRouteMotion.ts'
import { usePageScrollLock } from '../../components/layout/usePageScrollLock.ts'
import { useShortMobileViewport } from '../../components/layout/useShortMobileViewport.ts'
import { ContactForm } from '../../features/contact/components/ContactForm.tsx'
import styles from './ContactPage.module.css'

export function ContactPage() {
  const usesDocumentScroll = useShortMobileViewport()
  usePageScrollLock(!usesDocumentScroll, 'contact-route')
  const routeMotion = usePrimaryRouteMotion('contact')

  return (
    <section
      className={styles.page}
      aria-labelledby="contact-page-title"
      data-route-motion-direction={routeMotion.direction ?? undefined}
      data-route-motion-phase={routeMotion.phase}
      data-contact-document-scroll={usesDocumentScroll ? '' : undefined}
    >
      <h1 id="contact-page-title">WANNA BUILD STUFF?</h1>
      <div className={styles.content}>
        <RouteSurfaceMotion motion={routeMotion}>
          <div className={styles.panel}>
            <ContactForm
              layout="panel"
              titleId="contact-page-form-title"
              usesDocumentScroll={usesDocumentScroll}
            />
          </div>
        </RouteSurfaceMotion>
      </div>
    </section>
  )
}

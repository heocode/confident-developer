import { SocialLinks } from '../../../components/social/SocialLinks.tsx'
import { aboutContent } from '../../../data/about.ts'
import { siteSocialLinks } from '../../../data/site.ts'
import styles from '../AboutPage.module.css'
import { AboutInfoCard } from './AboutInfoCard.tsx'

export function AboutDetails() {
  return (
    <div className={styles.details}>
      <div className={styles.biographyCard}>
        <AboutInfoCard label="About me" value={aboutContent.biography} />
      </div>

      <div className={styles.educationCard}>
        <AboutInfoCard label="Education" value={aboutContent.education} />
      </div>

      <div className={styles.factCards}>
        <AboutInfoCard label="Based in" value={aboutContent.location} />
        <AboutInfoCard label="Currently building" value={aboutContent.currentProject} />
      </div>

      <div className={styles.links}>
        <h2>Links</h2>
        <SocialLinks className={styles.socialLinks} links={siteSocialLinks} />
      </div>
    </div>
  )
}

import arrowUrl from '../../../assets/icons/actions/arrow.svg'
import heroPortraitUrl from '../../../assets/images/profile/hero-portrait-sun.png'
import { siteIdentity, siteSocialLinks } from '../../../data/site'
import { SocialLinks } from './SocialLinks'
import styles from './HeroSection.module.css'
import { TorontoClock } from './TorontoClock'

export function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <p className={styles.identity}>
        <span>{siteIdentity.firstName}</span>
        <span>{siteIdentity.lastName}</span>
      </p>

      <span className={styles.keepBuilding} aria-hidden="true">
        KEEP
        <br />
        BUILDING
      </span>

      <div className={styles.portraitFrame}>
        <img
          className={styles.portrait}
          src={heroPortraitUrl}
          alt="Portrait of Vadim Iskakov"
          width="305"
          height="305"
        />
      </div>

      <div className={styles.introduction}>
        <h1 id="hero-title">{siteIdentity.heroTitle}</h1>
        <p>{siteIdentity.headline}</p>
      </div>

      <div className={styles.socials}>
        <SocialLinks links={siteSocialLinks} />
      </div>

      <a className={styles.scrollPrompt} href="#home-projects" aria-label="Scroll to the projects preview">
        <span className={styles.scrollIcon} aria-hidden="true">
          <img src={arrowUrl} alt="" />
        </span>
        <span>SCROLL TO EXPLORE</span>
      </a>

      <div className={styles.clock}>
        <TorontoClock />
      </div>
    </section>
  )
}

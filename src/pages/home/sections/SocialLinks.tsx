import githubUrl from '../../../assets/icons/social/github.svg'
import instagramUrl from '../../../assets/icons/social/instagram.svg'
import linkedinUrl from '../../../assets/icons/social/linkedin.svg'
import type { SiteSocialLink, SocialPlatform } from '../../../data/site'
import styles from './SocialLinks.module.css'

const iconByPlatform: Record<SocialPlatform, string> = {
  github: githubUrl,
  instagram: instagramUrl,
  linkedin: linkedinUrl,
}

interface SocialLinksProps {
  links: SiteSocialLink[]
}

export function SocialLinks({ links }: SocialLinksProps) {
  return (
    <ul className={styles.links} aria-label="Social profiles">
      {links.map((link) => (
        <li key={link.id}>
          <a href={link.url} target="_blank" rel="noreferrer" aria-label={`Visit ${link.label}`}>
            <img src={iconByPlatform[link.platform]} alt="" />
          </a>
        </li>
      ))}
    </ul>
  )
}

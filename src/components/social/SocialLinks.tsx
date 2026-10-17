import githubUrl from '../../assets/icons/social/github.svg'
import instagramUrl from '../../assets/icons/social/instagram.svg'
import linkedinUrl from '../../assets/icons/social/linkedin.svg'
import type { SiteSocialLink, SocialPlatform } from '../../data/site.ts'
import styles from './SocialLinks.module.css'

const iconByPlatform: Record<SocialPlatform, string> = {
  github: githubUrl,
  instagram: instagramUrl,
  linkedin: linkedinUrl,
}

interface SocialLinksProps {
  className?: string
  links: SiteSocialLink[]
}

export function SocialLinks({ className, links }: SocialLinksProps) {
  return (
    <ul
      className={[styles.links, className].filter(Boolean).join(' ')}
      aria-label="Social profiles"
    >
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

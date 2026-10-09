import appStoreIconUrl from '../../../assets/icons/social/app-store.svg'
import githubIconUrl from '../../../assets/icons/social/github.svg'
import globeIconUrl from '../../../assets/icons/social/globe.svg'
import type { ProjectLink, ProjectLinkIcon } from '../model/project.types.ts'
import styles from './ProjectLinks.module.css'

const iconByType: Record<ProjectLinkIcon, string> = {
  github: githubIconUrl,
  website: globeIconUrl,
  'app-store': appStoreIconUrl,
  external: globeIconUrl,
}

interface ProjectLinksProps {
  isInteractive: boolean
  links: ProjectLink[]
}

export function ProjectLinks({ isInteractive, links }: ProjectLinksProps) {
  if (links.length === 0) return null

  return (
    <ul className={styles.links} aria-label="Project links">
      {links.map((link) => (
        <li key={link.id}>
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            tabIndex={isInteractive ? undefined : -1}
            aria-label={`${link.label} (opens in a new tab)`}
          >
            <img src={iconByType[link.icon]} alt="" width="32" height="32" />
            <span>{link.label}</span>
            <span className={styles.external} aria-hidden="true">
              ↗
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}

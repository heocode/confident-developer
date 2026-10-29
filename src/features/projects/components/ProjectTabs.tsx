import { useRef } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import type { ProjectTabPresentation } from '../presentation/projects-page.ts'
import styles from './ProjectTabs.module.css'

interface ProjectTabsProps {
  activeSlug: string | null
  tabs: ProjectTabPresentation[]
}

type TabStyle = CSSProperties & { '--project-tab-background'?: string }

export function ProjectTabs({ activeSlug, tabs }: ProjectTabsProps) {
  const navigate = useNavigate()
  const tabRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const activeIndex = tabs.findIndex((tab) => tab.slug === activeSlug)
  const keyboardFocusIndex = activeIndex >= 0 ? activeIndex : 0

  const moveToTab = (event: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    let nextIndex: number | null = null

    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = tabs.length - 1
    if (nextIndex === null) return

    event.preventDefault()
    const nextTab = tabs[nextIndex]
    tabRefs.current[nextIndex]?.focus()
    navigate(`/projects/${nextTab.slug}`)
  }

  return (
    <div className={styles.tabs} role="tablist" aria-label="Published projects">
      {tabs.map((tab, index) => {
        const isActive = tab.slug === activeSlug
        const tabStyle: TabStyle = tab.theme
          ? { '--project-tab-background': tab.theme.tabColor }
          : {}

        return (
          <Link
            aria-controls="selected-project-panel"
            aria-label={tab.title}
            aria-selected={isActive}
            className={isActive ? `${styles.tab} ${styles.active}` : styles.tab}
            id={`project-tab-${tab.slug}`}
            key={tab.id}
            onKeyDown={(event) => moveToTab(event, index)}
            ref={(element) => {
              tabRefs.current[index] = element
            }}
            role="tab"
            style={tabStyle}
            tabIndex={index === keyboardFocusIndex ? 0 : -1}
            to={`/projects/${tab.slug}`}
          >
            <span aria-hidden="true" className={styles.focusRing} />
            <span className={styles.logoFrame}>
              <img
                alt=""
                height={tab.logo.height}
                src={tab.logo.url}
                width={tab.logo.width}
              />
            </span>
            <span className={styles.title}>{tab.title}</span>
          </Link>
        )
      })}
    </div>
  )
}

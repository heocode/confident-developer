import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import { siteIdentity } from '../../data/site'

const navigationItems = [
  { label: 'Home', to: '/' },
  { label: 'Projects', to: '/projects' },
  { label: 'Services', to: '/services' },
  { label: 'About me', to: '/about' },
  { label: 'References', to: '/references' },
  { label: 'Contact Me', to: '/contact' },
]

export function SiteNavigation() {
  const location = useLocation()
  const navigationRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [visibility, setVisibility] = useState({ isHidden: false, pathname: location.pathname })
  const lastMeasuredScrollPosition = useRef(0)
  const animationFrame = useRef<number | null>(null)
  const isHidden = !isMenuOpen && visibility.pathname === location.pathname && visibility.isHidden
  const navigationFrameClassName = [
    'site-navigation-frame',
    isHidden ? 'site-navigation-frame--hidden' : '',
    isMenuOpen ? 'site-navigation-frame--menu-open' : '',
  ]
    .filter(Boolean)
    .join(' ')

  useEffect(() => {
    lastMeasuredScrollPosition.current = window.scrollY
    const routeResetFrame = window.requestAnimationFrame(() => {
      setIsMenuOpen(false)
      setVisibility({ isHidden: false, pathname: location.pathname })
    })

    const updateVisibility = () => {
      const currentScrollPosition = window.scrollY
      const scrollDistance = currentScrollPosition - lastMeasuredScrollPosition.current

      if (currentScrollPosition <= 24) {
        setVisibility({ isHidden: false, pathname: location.pathname })
        lastMeasuredScrollPosition.current = currentScrollPosition
      } else if (Math.abs(scrollDistance) >= 12) {
        setVisibility({ isHidden: scrollDistance > 0, pathname: location.pathname })
        lastMeasuredScrollPosition.current = currentScrollPosition
      }

      animationFrame.current = null
    }

    const handleScroll = () => {
      if (animationFrame.current !== null) return
      animationFrame.current = window.requestAnimationFrame(updateVisibility)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.cancelAnimationFrame(routeResetFrame)
      if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current)
    }
  }, [location.pathname])

  useEffect(() => {
    if (!isMenuOpen) return

    const mobileNavigationQuery = window.matchMedia('(max-width: 48rem)')
    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const closeMenuAtDesktopSize = (event: MediaQueryListEvent) => {
      if (!event.matches) setIsMenuOpen(false)
    }

    const closeMenuFromOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !navigationRef.current?.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    const closeMenuFromKeyboard = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setIsMenuOpen(false)
      menuButtonRef.current?.focus()
    }

    mobileNavigationQuery.addEventListener('change', closeMenuAtDesktopSize)
    document.addEventListener('pointerdown', closeMenuFromOutside)
    document.addEventListener('keydown', closeMenuFromKeyboard)

    return () => {
      document.body.style.overflow = previousBodyOverflow
      mobileNavigationQuery.removeEventListener('change', closeMenuAtDesktopSize)
      document.removeEventListener('pointerdown', closeMenuFromOutside)
      document.removeEventListener('keydown', closeMenuFromKeyboard)
    }
  }, [isMenuOpen])

  return (
    <nav
      className={navigationFrameClassName}
      aria-label="Primary navigation"
      onFocusCapture={() => setVisibility({ isHidden: false, pathname: location.pathname })}
      ref={navigationRef}
    >
      <span className="site-navigation-brand" aria-hidden="true">
        <span>{siteIdentity.firstName}</span>
        <span>{siteIdentity.lastName}</span>
      </span>

      <button
        className="site-navigation-toggle"
        type="button"
        aria-controls="primary-navigation"
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        onClick={() => setIsMenuOpen((currentState) => !currentState)}
        ref={menuButtonRef}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      <ul
        className={isMenuOpen ? 'site-navigation site-navigation--open' : 'site-navigation'}
        id="primary-navigation"
      >
        {navigationItems.map(({ label, to }) => (
          <li key={to}>
            <NavLink
              className={({ isActive }) =>
                isActive ? 'site-navigation__link site-navigation__link--active' : 'site-navigation__link'
              }
              end={to === '/'}
              onClick={() => setIsMenuOpen(false)}
              to={to}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

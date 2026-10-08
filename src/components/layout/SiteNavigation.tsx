import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

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
  const [visibility, setVisibility] = useState({ isHidden: false, pathname: location.pathname })
  const lastMeasuredScrollPosition = useRef(0)
  const animationFrame = useRef<number | null>(null)
  const isHidden = visibility.pathname === location.pathname && visibility.isHidden

  useEffect(() => {
    lastMeasuredScrollPosition.current = window.scrollY
    const routeResetFrame = window.requestAnimationFrame(() => {
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

  return (
    <nav
      className={isHidden ? 'site-navigation-frame site-navigation-frame--hidden' : 'site-navigation-frame'}
      aria-label="Primary navigation"
      onFocusCapture={() => setVisibility({ isHidden: false, pathname: location.pathname })}
    >
      <ul className="site-navigation">
        {navigationItems.map(({ label, to }) => (
          <li key={to}>
            <NavLink
              className={({ isActive }) =>
                isActive ? 'site-navigation__link site-navigation__link--active' : 'site-navigation__link'
              }
              end={to === '/'}
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

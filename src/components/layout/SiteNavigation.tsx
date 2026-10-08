import { NavLink } from 'react-router-dom'

const navigationItems = [
  { label: 'Home', to: '/' },
  { label: 'Projects', to: '/projects' },
  { label: 'Services', to: '/services' },
  { label: 'About me', to: '/about' },
  { label: 'References', to: '/references' },
  { label: 'Contact Me', to: '/contact' },
]

export function SiteNavigation() {
  return (
    <nav aria-label="Primary navigation">
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

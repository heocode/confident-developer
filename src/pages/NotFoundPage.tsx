import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="route-page" aria-labelledby="not-found-title">
      <p className="route-page__eyebrow">404</p>
      <h1 id="not-found-title">Page not found</h1>
      <Link className="text-link" to="/">
        Return home
      </Link>
    </section>
  )
}

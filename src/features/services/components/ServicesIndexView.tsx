import { Link } from 'react-router-dom'

import type { ServiceSummaryPresentation } from '../presentation/services-page.ts'

interface ServicesIndexViewProps {
  services: ServiceSummaryPresentation[]
}

export function ServicesIndexView({ services }: ServicesIndexViewProps) {
  return (
    <ul aria-label="Published Services">
      {services.map((service) => (
        <li key={service.id}>
          <Link to={`/services/${service.slug}`}>{service.title}</Link>
        </li>
      ))}
    </ul>
  )
}

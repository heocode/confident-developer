import { Link } from 'react-router-dom'

import type { ServiceSummary } from '../model/service.types.ts'

interface ServicesIndexViewProps {
  services: ServiceSummary[]
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

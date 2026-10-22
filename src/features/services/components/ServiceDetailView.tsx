import { Link } from 'react-router-dom'

import type { SelectedServicePresentation } from '../presentation/services-page.ts'

interface ServiceDetailViewProps {
  service: SelectedServicePresentation
}

export function ServiceDetailView({ service }: ServiceDetailViewProps) {
  return (
    <article aria-labelledby={`service-${service.slug}-title`}>
      <h2 id={`service-${service.slug}-title`}>{service.title}</h2>
      <p>{service.description}</p>
      <p>
        {service.capabilities.length} capabilities, {service.tools.length} tools,{' '}
        {service.relatedProjects.length} related projects, and {service.showcaseAssets.length}{' '}
        showcase assets are ready for the UI iteration.
      </p>
      <Link to="/services">Back to Services</Link>
    </article>
  )
}

import type {
  HomeService,
  ServiceSummary,
} from '../model/service.types.ts'
import type { ServiceIconAssets } from './service-icon-assets.ts'

export function createHomeServicesPresentation(
  services: readonly ServiceSummary[],
  iconAssets: ServiceIconAssets,
): HomeService[] {
  return services.map((service) => ({
    ...service,
    icon: iconAssets[service.icon],
  }))
}

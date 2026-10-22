import type {
  HomeService,
  ServiceIconAsset,
  ServiceIconKey,
  ServiceSummary,
} from '../model/service.types.ts'

export type ServiceIconAssets = Readonly<Record<ServiceIconKey, ServiceIconAsset>>

export function createHomeServicesPresentation(
  services: readonly ServiceSummary[],
  iconAssets: ServiceIconAssets,
): HomeService[] {
  return services.map((service) => ({
    ...service,
    icon: iconAssets[service.icon],
  }))
}

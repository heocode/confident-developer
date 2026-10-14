import type {
  HomeService,
  PublicService,
  ServiceIconAsset,
  ServiceIconKey,
} from '../model/service.types.ts'

export type ServiceIconAssets = Readonly<Record<ServiceIconKey, ServiceIconAsset>>

export function createHomeServicesPresentation(
  services: readonly PublicService[],
  iconAssets: ServiceIconAssets,
): HomeService[] {
  return services.map((service) => ({
    ...service,
    icon: iconAssets[service.icon],
  }))
}

import type { ServiceTone } from '../model/service.types.ts'

export interface ServiceTonePresentation {
  color: string
  key: ServiceTone
}

export type ServiceToneThemes = Readonly<Record<ServiceTone, ServiceTonePresentation>>

export const serviceToneThemes = {
  product: { key: 'product', color: 'var(--color-service-product)' },
  mobile: { key: 'mobile', color: 'var(--color-service-mobile)' },
  web: { key: 'web', color: 'var(--color-service-web)' },
  backend: { key: 'backend', color: 'var(--color-service-backend)' },
} as const satisfies ServiceToneThemes

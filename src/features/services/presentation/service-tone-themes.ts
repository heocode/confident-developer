import type { ServiceTone } from '../model/service.types.ts'

export interface ServiceTonePresentation {
  color: string
  key: ServiceTone
  surfaceColor: string
}

export type ServiceToneThemes = Readonly<Record<ServiceTone, ServiceTonePresentation>>

export const serviceMobileWidths = {
  product: '90.5vw',
  mobile: '86.5vw',
  web: '88.5vw',
  backend: '85vw',
} as const satisfies Readonly<Record<ServiceTone, string>>

export const serviceToneThemes = {
  product: {
    key: 'product',
    color: 'var(--color-service-product)',
    surfaceColor: 'var(--color-service-product-surface)',
  },
  mobile: {
    key: 'mobile',
    color: 'var(--color-service-mobile)',
    surfaceColor: 'var(--color-service-mobile-surface)',
  },
  web: {
    key: 'web',
    color: 'var(--color-service-web)',
    surfaceColor: 'var(--color-service-web-surface)',
  },
  backend: {
    key: 'backend',
    color: 'var(--color-service-backend)',
    surfaceColor: 'var(--color-service-backend-surface)',
  },
} as const satisfies ServiceToneThemes

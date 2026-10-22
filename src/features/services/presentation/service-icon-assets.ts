import backendDevelopmentIconUrl from '../../../assets/icons/services/backend-development.svg'
import mobileDevelopmentIconUrl from '../../../assets/icons/services/mobile-development.svg'
import productUiUxIconUrl from '../../../assets/icons/services/product-ui-ux.svg'
import webDevelopmentIconUrl from '../../../assets/icons/services/web-development.svg'
import type { ServiceIconAsset, ServiceIconKey } from '../model/service.types.ts'

export type ServiceIconAssets = Readonly<Record<ServiceIconKey, ServiceIconAsset>>

export const serviceIconAssets = {
  'product-ui-ux': { src: productUiUxIconUrl, width: 85, height: 83 },
  'mobile-development': { src: mobileDevelopmentIconUrl, width: 60, height: 85 },
  'web-development': { src: webDevelopmentIconUrl, width: 85, height: 75 },
  'backend-development': { src: backendDevelopmentIconUrl, width: 84, height: 84 },
} as const satisfies ServiceIconAssets

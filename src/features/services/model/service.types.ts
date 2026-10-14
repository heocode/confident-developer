export type ServiceTone = 'product' | 'mobile' | 'web' | 'backend'
export type ServiceIconKey =
  | 'product-ui-ux'
  | 'mobile-development'
  | 'web-development'
  | 'backend-development'

export interface PublicService {
  id: string
  slug: string
  title: string
  description: string
  icon: ServiceIconKey
  tone: ServiceTone
  home: {
    featured: boolean
  }
}

export interface ServiceIconAsset {
  height: number
  src: string
  width: number
}

export interface HomeService extends Omit<PublicService, 'icon'> {
  icon: ServiceIconAsset
}

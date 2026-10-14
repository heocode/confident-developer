export type ServiceTone = 'product' | 'mobile' | 'web' | 'backend'

export interface ServiceIcon {
  height: number
  src: string
  width: number
}

export interface HomeService {
  description: string
  icon: ServiceIcon
  id: string
  title: string
  tone: ServiceTone
}

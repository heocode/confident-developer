export type ServiceTone = 'product' | 'mobile' | 'web' | 'backend'
export type ServiceIconKey =
  | 'product-ui-ux'
  | 'mobile-development'
  | 'web-development'
  | 'backend-development'
export type ServiceToolKey =
  | 'jitter'
  | 'rive'
  | 'figma'
  | 'react'
  | 'typescript'
  | 'expo'
  | 'nextjs'
  | 'wordpress'
  | 'vercel'
  | 'nestjs'
  | 'postgresql'
  | 'prisma'
export type ShowcaseAssetKind = 'image' | 'video' | 'animation'

export interface ServiceSummary {
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

export interface ServiceTool {
  key: ServiceToolKey
  label: string
}

export interface ServiceImage {
  id: string
  url: string
  alt: string
  width: number
  height: number
}

export interface RelatedProject {
  id: string
  slug: string
  title: string
  logo: ServiceImage
}

export type ShowcaseAssetPreview = ServiceImage

export interface ShowcaseAsset {
  id: string
  kind: ShowcaseAssetKind
  format: string
  url: string
  alt: string
  width: number | null
  height: number | null
  duration: number | null
  preview: ShowcaseAssetPreview | null
}

export interface ServiceDetail extends ServiceSummary {
  capabilities: string[]
  tools: ServiceTool[]
  relatedProjects: RelatedProject[]
  showcaseAssets: ShowcaseAsset[]
}

export interface ServiceIconAsset {
  height: number
  src: string
  width: number
}

export interface HomeService extends Omit<ServiceSummary, 'icon'> {
  icon: ServiceIconAsset
}

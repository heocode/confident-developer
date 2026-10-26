import type {
  RelatedProject,
  ServiceDetail,
  ServiceIconAsset,
  ServiceSummary,
  ServiceTool,
  ShowcaseAsset,
  ShowcaseAssetPreview,
} from '../model/service.types.ts'
import type { ServiceIconAssets } from './service-icon-assets.ts'
import type { ServiceTonePresentation, ServiceToneThemes } from './service-tone-themes.ts'
import type { ServiceToolAssets, ServiceToolIconAsset } from './service-tool-assets.ts'

export interface ServicePresentationAssets {
  icons: ServiceIconAssets
  tones: ServiceToneThemes
  tools: ServiceToolAssets
}

export type ServicesPageConfigurationIssueCode =
  | 'detail-service-mismatch'
  | 'unknown-service-icon'
  | 'unknown-service-tone'
  | 'unknown-service-tool'
  | 'unknown-showcase-kind'
  | 'missing-capabilities'
  | 'missing-tools'
  | 'missing-related-projects'
  | 'missing-showcase'
  | 'invalid-project-logo-dimensions'
  | 'invalid-showcase-dimensions'
  | 'missing-motion-preview'
  | 'invalid-preview-dimensions'

export interface ServicesPageConfigurationIssue {
  code: ServicesPageConfigurationIssueCode
  resourceId?: string
  serviceSlug: string
  value?: string
}

export interface ServiceSummaryPresentation {
  description: string
  icon: ServiceIconAsset
  id: string
  slug: string
  title: string
  tone: ServiceTonePresentation
}

export interface ServiceToolPresentation extends ServiceTool {
  icon: ServiceToolIconAsset
}

export interface ServiceImagePresentation {
  alt: string
  aspectRatio: number
  height: number
  id: string
  url: string
  width: number
}

export interface RelatedProjectPresentation extends Omit<RelatedProject, 'logo'> {
  logo: ServiceImagePresentation
}

interface ShowcaseAssetPresentationBase {
  alt: string
  aspectRatio: number
  duration: number | null
  format: string
  height: number | null
  id: string
  preview: ServiceImagePresentation | null
  url: string
  width: number | null
}

export interface ImageShowcaseAssetPresentation extends ShowcaseAssetPresentationBase {
  kind: 'image'
  height: number
  width: number
}

interface MotionShowcaseAssetPresentationBase
  extends ShowcaseAssetPresentationBase {
  preview: ServiceImagePresentation
}

export interface AnimationShowcaseAssetPresentation
  extends MotionShowcaseAssetPresentationBase {
  kind: 'animation'
}

export interface VideoShowcaseAssetPresentation
  extends MotionShowcaseAssetPresentationBase {
  kind: 'video'
}

export type MotionShowcaseAssetPresentation =
  | AnimationShowcaseAssetPresentation
  | VideoShowcaseAssetPresentation

export type ShowcaseAssetPresentation =
  | ImageShowcaseAssetPresentation
  | MotionShowcaseAssetPresentation

export interface SelectedServicePresentation extends ServiceSummaryPresentation {
  capabilities: string[]
  relatedProjects: RelatedProjectPresentation[]
  showcaseAssets: ShowcaseAssetPresentation[]
  tools: ServiceToolPresentation[]
}

export interface ServicesIndexPresentation {
  services: ServiceSummaryPresentation[]
}

export interface ServicesPagePresentation extends ServicesIndexPresentation {
  selectedService: SelectedServicePresentation
}

type PresentationResult<T> =
  | { configurationIssue: null; presentation: T }
  | { configurationIssue: ServicesPageConfigurationIssue; presentation: null }

function hasValidDimensions(media: { height: number | null; width: number | null }) {
  return (
    typeof media.width === 'number' &&
    Number.isFinite(media.width) &&
    media.width > 0 &&
    typeof media.height === 'number' &&
    Number.isFinite(media.height) &&
    media.height > 0
  )
}

function getMappedValue<T>(mapping: object, key: string): T | undefined {
  return (mapping as Readonly<Record<string, T>>)[key]
}

function createImagePresentation(
  image: ShowcaseAssetPreview | RelatedProject['logo'],
): ServiceImagePresentation {
  return {
    ...image,
    aspectRatio: image.width / image.height,
  }
}

function createSummaryPresentation(
  service: ServiceSummary,
  assets: ServicePresentationAssets,
): PresentationResult<ServiceSummaryPresentation> {
  const icon = getMappedValue<ServiceIconAsset>(assets.icons, service.icon)

  if (!icon) {
    return {
      configurationIssue: {
        code: 'unknown-service-icon',
        serviceSlug: service.slug,
        value: service.icon,
      },
      presentation: null,
    }
  }

  const tone = getMappedValue<ServiceTonePresentation>(assets.tones, service.tone)

  if (!tone) {
    return {
      configurationIssue: {
        code: 'unknown-service-tone',
        serviceSlug: service.slug,
        value: service.tone,
      },
      presentation: null,
    }
  }

  return {
    configurationIssue: null,
    presentation: {
      id: service.id,
      slug: service.slug,
      title: service.title,
      description: service.description,
      icon: { ...icon },
      tone: { ...tone },
    },
  }
}

function createToolsPresentation(
  service: ServiceDetail,
  assets: ServicePresentationAssets,
): PresentationResult<ServiceToolPresentation[]> {
  if (service.tools.length === 0) {
    return {
      configurationIssue: { code: 'missing-tools', serviceSlug: service.slug },
      presentation: null,
    }
  }

  const tools: ServiceToolPresentation[] = []

  for (const tool of service.tools) {
    const icon = getMappedValue<ServiceToolIconAsset>(assets.tools, tool.key)

    if (!icon) {
      return {
        configurationIssue: {
          code: 'unknown-service-tool',
          serviceSlug: service.slug,
          value: tool.key,
        },
        presentation: null,
      }
    }

    tools.push({ ...tool, icon: { ...icon } })
  }

  return { configurationIssue: null, presentation: tools }
}

function createProjectsPresentation(
  service: ServiceDetail,
): PresentationResult<RelatedProjectPresentation[]> {
  if (service.relatedProjects.length === 0) {
    return {
      configurationIssue: { code: 'missing-related-projects', serviceSlug: service.slug },
      presentation: null,
    }
  }

  const projects: RelatedProjectPresentation[] = []

  for (const project of service.relatedProjects) {
    if (!hasValidDimensions(project.logo)) {
      return {
        configurationIssue: {
          code: 'invalid-project-logo-dimensions',
          resourceId: project.logo.id,
          serviceSlug: service.slug,
        },
        presentation: null,
      }
    }

    projects.push({ ...project, logo: createImagePresentation(project.logo) })
  }

  return { configurationIssue: null, presentation: projects }
}

function createMotionPresentation(
  serviceSlug: string,
  asset: ShowcaseAsset & { kind: 'animation' | 'video' },
): PresentationResult<MotionShowcaseAssetPresentation> {
  if (!asset.preview) {
    return {
      configurationIssue: {
        code: 'missing-motion-preview',
        resourceId: asset.id,
        serviceSlug,
      },
      presentation: null,
    }
  }

  if (!hasValidDimensions(asset.preview)) {
    return {
      configurationIssue: {
        code: 'invalid-preview-dimensions',
        resourceId: asset.preview.id,
        serviceSlug,
      },
      presentation: null,
    }
  }

  const hasOwnDimensions = hasValidDimensions(asset)
  const hasNoOwnDimensions = asset.width === null && asset.height === null

  if (!hasOwnDimensions && !hasNoOwnDimensions) {
    return {
      configurationIssue: {
        code: 'invalid-showcase-dimensions',
        resourceId: asset.id,
        serviceSlug,
      },
      presentation: null,
    }
  }

  const preview = createImagePresentation(asset.preview)

  const presentation = {
    ...asset,
    aspectRatio: hasOwnDimensions
      ? (asset.width as number) / (asset.height as number)
      : preview.aspectRatio,
    preview,
  }

  return asset.kind === 'video'
    ? {
        configurationIssue: null,
        presentation: { ...presentation, kind: 'video' },
      }
    : {
        configurationIssue: null,
        presentation: { ...presentation, kind: 'animation' },
      }
}

function createShowcasePresentation(
  service: ServiceDetail,
): PresentationResult<ShowcaseAssetPresentation[]> {
  if (service.showcaseAssets.length === 0) {
    return {
      configurationIssue: { code: 'missing-showcase', serviceSlug: service.slug },
      presentation: null,
    }
  }

  const showcase: ShowcaseAssetPresentation[] = []

  for (const asset of service.showcaseAssets) {
    if (asset.kind === 'image') {
      if (!hasValidDimensions(asset)) {
        return {
          configurationIssue: {
            code: 'invalid-showcase-dimensions',
            resourceId: asset.id,
            serviceSlug: service.slug,
          },
          presentation: null,
        }
      }

      if (asset.preview && !hasValidDimensions(asset.preview)) {
        return {
          configurationIssue: {
            code: 'invalid-preview-dimensions',
            resourceId: asset.preview.id,
            serviceSlug: service.slug,
          },
          presentation: null,
        }
      }

      showcase.push({
        ...asset,
        kind: 'image',
        width: asset.width as number,
        height: asset.height as number,
        aspectRatio: (asset.width as number) / (asset.height as number),
        preview: asset.preview ? createImagePresentation(asset.preview) : null,
      })
      continue
    }

    if (asset.kind === 'video' || asset.kind === 'animation') {
      const result = createMotionPresentation(service.slug, {
        ...asset,
        kind: asset.kind,
      })
      if (result.configurationIssue) return result
      showcase.push(result.presentation)
      continue
    }

    return {
      configurationIssue: {
        code: 'unknown-showcase-kind',
        resourceId: asset.id,
        serviceSlug: service.slug,
        value: asset.kind,
      },
      presentation: null,
    }
  }

  return { configurationIssue: null, presentation: showcase }
}

export function createServicesIndexPresentation(
  services: readonly ServiceSummary[],
  assets: ServicePresentationAssets,
): PresentationResult<ServicesIndexPresentation> {
  const presentation: ServiceSummaryPresentation[] = []

  for (const service of services) {
    const result = createSummaryPresentation(service, assets)
    if (result.configurationIssue) return result
    presentation.push(result.presentation)
  }

  return {
    configurationIssue: null,
    presentation: { services: presentation },
  }
}

export function createServicesPagePresentation(
  services: readonly ServiceSummary[],
  detail: ServiceDetail,
  assets: ServicePresentationAssets,
): PresentationResult<ServicesPagePresentation> {
  const listedService = services.find((service) => service.slug === detail.slug)

  if (!listedService || listedService.id !== detail.id) {
    return {
      configurationIssue: {
        code: 'detail-service-mismatch',
        serviceSlug: detail.slug,
      },
      presentation: null,
    }
  }

  const indexResult = createServicesIndexPresentation(services, assets)
  if (indexResult.configurationIssue) return indexResult

  if (detail.capabilities.length === 0) {
    return {
      configurationIssue: { code: 'missing-capabilities', serviceSlug: detail.slug },
      presentation: null,
    }
  }

  const summaryResult = createSummaryPresentation(detail, assets)
  if (summaryResult.configurationIssue) return summaryResult

  const toolsResult = createToolsPresentation(detail, assets)
  if (toolsResult.configurationIssue) return toolsResult

  const projectsResult = createProjectsPresentation(detail)
  if (projectsResult.configurationIssue) return projectsResult

  const showcaseResult = createShowcasePresentation(detail)
  if (showcaseResult.configurationIssue) return showcaseResult

  return {
    configurationIssue: null,
    presentation: {
      services: indexResult.presentation.services,
      selectedService: {
        ...summaryResult.presentation,
        capabilities: [...detail.capabilities],
        tools: toolsResult.presentation,
        relatedProjects: projectsResult.presentation,
        showcaseAssets: showcaseResult.presentation,
      },
    },
  }
}

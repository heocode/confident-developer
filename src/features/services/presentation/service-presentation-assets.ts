import { serviceIconAssets } from './service-icon-assets.ts'
import { serviceToneThemes } from './service-tone-themes.ts'
import { serviceToolAssets } from './service-tool-assets.ts'
import type { ServicePresentationAssets } from './services-page.ts'

export const servicePresentationAssets = {
  icons: serviceIconAssets,
  tones: serviceToneThemes,
  tools: serviceToolAssets,
} satisfies ServicePresentationAssets

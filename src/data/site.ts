export type SocialPlatform = 'github' | 'instagram' | 'linkedin'

export interface SiteSocialLink {
  id: string
  label: string
  platform: SocialPlatform
  url: string
}

export const siteIdentity = {
  firstName: 'Vadim',
  lastName: 'Iskakov',
  headline: 'Product-Focused Software Developer',
  heroTitle: 'I BUILD STUFF',
  timezone: 'America/Toronto',
} as const

export const siteSocialLinks: SiteSocialLink[] = [
  {
    id: 'github',
    label: 'GitHub',
    platform: 'github',
    url: 'https://github.com/heocode',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    platform: 'linkedin',
    url: 'https://www.linkedin.com/in/vadim-heocode',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    platform: 'instagram',
    url: 'https://www.instagram.com/heoposit50',
  },
]

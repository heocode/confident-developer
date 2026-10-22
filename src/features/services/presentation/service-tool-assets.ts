import expoIconUrl from '../../../assets/icons/services/tools/expo.svg'
import figmaIconUrl from '../../../assets/icons/services/tools/figma.svg'
import jitterIconUrl from '../../../assets/icons/services/tools/jitter.svg'
import nestjsIconUrl from '../../../assets/icons/services/tools/nestjs.svg'
import nextjsIconUrl from '../../../assets/icons/services/tools/nextjs.svg'
import postgresqlIconUrl from '../../../assets/icons/services/tools/postgresql.svg'
import prismaIconUrl from '../../../assets/icons/services/tools/prisma.svg'
import reactIconUrl from '../../../assets/icons/services/tools/react.svg'
import riveIconUrl from '../../../assets/icons/services/tools/rive.svg'
import typescriptIconUrl from '../../../assets/icons/services/tools/typescript.svg'
import vercelIconUrl from '../../../assets/icons/services/tools/vercel.svg'
import wordpressIconUrl from '../../../assets/icons/services/tools/wordpress.svg'
import type { ServiceToolKey } from '../model/service.types.ts'

export interface ServiceToolIconAsset {
  height: number
  src: string
  width: number
}

export type ServiceToolAssets = Readonly<Record<ServiceToolKey, ServiceToolIconAsset>>

export const serviceToolAssets = {
  jitter: { src: jitterIconUrl, width: 61, height: 61 },
  rive: { src: riveIconUrl, width: 61, height: 61 },
  figma: { src: figmaIconUrl, width: 61, height: 61 },
  react: { src: reactIconUrl, width: 61, height: 61 },
  typescript: { src: typescriptIconUrl, width: 61, height: 61 },
  expo: { src: expoIconUrl, width: 61, height: 61 },
  nextjs: { src: nextjsIconUrl, width: 61, height: 61 },
  wordpress: { src: wordpressIconUrl, width: 61, height: 61 },
  vercel: { src: vercelIconUrl, width: 61, height: 61 },
  nestjs: { src: nestjsIconUrl, width: 61, height: 61 },
  postgresql: { src: postgresqlIconUrl, width: 61, height: 61 },
  prisma: { src: prismaIconUrl, width: 61, height: 61 },
} as const satisfies ServiceToolAssets

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { PublicService } from '../../../src/features/services/model/service.types.ts'
import { createHomeServicesPresentation } from '../../../src/features/services/presentation/home-services.ts'
import type { ServiceIconAssets } from '../../../src/features/services/presentation/home-services.ts'

const iconAssets: ServiceIconAssets = {
  'product-ui-ux': { src: '/icons/product-ui-ux.svg', width: 85, height: 83 },
  'mobile-development': { src: '/icons/mobile-development.svg', width: 60, height: 85 },
  'web-development': { src: '/icons/web-development.svg', width: 85, height: 75 },
  'backend-development': { src: '/icons/backend-development.svg', width: 84, height: 84 },
}

const services: PublicService[] = [
  {
    id: 'service-1',
    slug: 'web-development',
    title: 'Web Development',
    description: 'A synthetic web service fixture.',
    icon: 'web-development',
    tone: 'web',
    home: { featured: true },
  },
  {
    id: 'service-2',
    slug: 'backend-architecture',
    title: 'Backend & Architecture',
    description: 'A synthetic backend service fixture.',
    icon: 'backend-development',
    tone: 'backend',
    home: { featured: true },
  },
]

describe('Home Services presentation', () => {
  it('preserves backend order and maps frontend-owned icon assets', () => {
    const result = createHomeServicesPresentation(services, iconAssets)

    assert.deepEqual(result.map(({ slug }) => slug), [
      'web-development',
      'backend-architecture',
    ])
    assert.match(result[0].icon.src, /web-development\.svg$/)
    assert.deepEqual(
      result.map(({ icon }) => ({ width: icon.width, height: icon.height })),
      [
        { width: 85, height: 75 },
        { width: 84, height: 84 },
      ],
    )
  })
})

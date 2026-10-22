import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type {
  ServiceDetail,
  ServiceSummary,
  ServiceToolKey,
} from '../../../src/features/services/model/service.types.ts'
import {
  createServicesIndexPresentation,
  createServicesPagePresentation,
} from '../../../src/features/services/presentation/services-page.ts'
import type {
  ServicePresentationAssets,
  ServicesPageConfigurationIssueCode,
} from '../../../src/features/services/presentation/services-page.ts'

const toolKeys: ServiceToolKey[] = [
  'jitter',
  'rive',
  'figma',
  'react',
  'typescript',
  'expo',
  'nextjs',
  'wordpress',
  'vercel',
  'nestjs',
  'postgresql',
  'prisma',
]

const testAssets: ServicePresentationAssets = {
  icons: {
    'product-ui-ux': { src: '/product.svg', width: 85, height: 83 },
    'mobile-development': { src: '/mobile.svg', width: 60, height: 85 },
    'web-development': { src: '/web.svg', width: 85, height: 75 },
    'backend-development': { src: '/backend.svg', width: 84, height: 84 },
  },
  tones: {
    product: { key: 'product', color: 'product-color' },
    mobile: { key: 'mobile', color: 'mobile-color' },
    web: { key: 'web', color: 'web-color' },
    backend: { key: 'backend', color: 'backend-color' },
  },
  tools: Object.fromEntries(
    toolKeys.map((key) => [key, { src: `/${key}.svg`, width: 61, height: 61 }]),
  ) as ServicePresentationAssets['tools'],
}

function createSummary(id: string, overrides: Partial<ServiceSummary> = {}): ServiceSummary {
  return {
    id,
    slug: id,
    title: `Service ${id}`,
    description: `${id} description`,
    icon: 'product-ui-ux',
    tone: 'product',
    home: { featured: true },
    ...overrides,
  }
}

function createPreview(id: string) {
  return {
    id,
    url: `https://cdn.example.test/${id}.webp`,
    alt: `${id} preview`,
    width: 800,
    height: 800,
  }
}

function createDetail(overrides: Partial<ServiceDetail> = {}): ServiceDetail {
  return {
    ...createSummary('product-ui-ux'),
    capabilities: ['First capability', 'Second capability'],
    tools: toolKeys.map((key) => ({ key, label: `Label ${key}` })),
    relatedProjects: [
      {
        id: 'project-one',
        slug: 'project-one',
        title: 'Project One',
        logo: {
          id: 'project-one-logo',
          url: 'https://cdn.example.test/project-one-logo.webp',
          alt: 'Project One logo',
          width: 600,
          height: 300,
        },
      },
      {
        id: 'project-two',
        slug: 'project-two',
        title: 'Project Two',
        logo: {
          id: 'project-two-logo',
          url: 'https://cdn.example.test/project-two-logo.webp',
          alt: 'Project Two logo',
          width: 512,
          height: 512,
        },
      },
    ],
    showcaseAssets: [
      {
        id: 'image-one',
        kind: 'image',
        format: 'webp',
        url: 'https://cdn.example.test/image-one.webp',
        alt: 'Image one',
        width: 600,
        height: 1200,
        duration: null,
        preview: null,
      },
      {
        id: 'video-one',
        kind: 'video',
        format: 'mp4',
        url: 'https://cdn.example.test/video-one.mp4',
        alt: 'Video one',
        width: 720,
        height: 1280,
        duration: 12.5,
        preview: createPreview('video-one-preview'),
      },
      {
        id: 'animation-one',
        kind: 'animation',
        format: 'riv',
        url: 'https://cdn.example.test/animation-one.riv',
        alt: 'Animation one',
        width: null,
        height: null,
        duration: null,
        preview: createPreview('animation-one-preview'),
      },
    ],
    ...overrides,
  }
}

function getIssueCode(
  detail: ServiceDetail,
  services: ServiceSummary[] = [createSummary('product-ui-ux')],
) {
  const result = createServicesPagePresentation(services, detail, testAssets)
  return result.configurationIssue?.code ?? null
}

describe('Services index presentation', () => {
  it('preserves backend order and maps frontend-owned icons and tones', () => {
    const services = [
      createSummary('web', { icon: 'web-development', tone: 'web' }),
      createSummary('backend', { icon: 'backend-development', tone: 'backend' }),
    ]
    const snapshot = structuredClone(services)
    const result = createServicesIndexPresentation(services, testAssets)

    assert.equal(result.configurationIssue, null)
    if (result.configurationIssue) return
    assert.deepEqual(result.presentation.services.map(({ slug }) => slug), ['web', 'backend'])
    assert.equal(result.presentation.services[0].icon.src, '/web.svg')
    assert.equal(result.presentation.services[1].tone.color, 'backend-color')
    assert.deepEqual(services, snapshot)
  })

  it('reports unknown service icon and tone keys from an invalid API response', () => {
    const unknownIcon = createSummary('invalid-icon', {
      icon: 'unknown-icon' as ServiceSummary['icon'],
    })
    const iconResult = createServicesIndexPresentation([unknownIcon], testAssets)
    assert.equal(iconResult.configurationIssue?.code, 'unknown-service-icon')

    const unknownTone = createSummary('invalid-tone', {
      tone: 'unknown-tone' as ServiceSummary['tone'],
    })
    const toneResult = createServicesIndexPresentation([unknownTone], testAssets)
    assert.equal(toneResult.configurationIssue?.code, 'unknown-service-tone')
  })
})

describe('Services detail presentation', () => {
  it('preserves every backend collection and maps all allowlisted tools', () => {
    const detail = createDetail()
    const snapshot = structuredClone(detail)
    const result = createServicesPagePresentation(
      [createSummary('product-ui-ux')],
      detail,
      testAssets,
    )

    assert.equal(result.configurationIssue, null)
    if (result.configurationIssue) return

    const selected = result.presentation.selectedService
    assert.deepEqual(selected.capabilities, ['First capability', 'Second capability'])
    assert.deepEqual(selected.tools.map(({ key }) => key), toolKeys)
    assert.deepEqual(selected.tools.map(({ icon }) => icon.width), toolKeys.map(() => 61))
    assert.deepEqual(selected.relatedProjects.map(({ slug }) => slug), [
      'project-one',
      'project-two',
    ])
    assert.deepEqual(selected.showcaseAssets.map(({ id }) => id), [
      'image-one',
      'video-one',
      'animation-one',
    ])
    assert.equal(selected.relatedProjects[0].logo.aspectRatio, 2)
    assert.equal(selected.showcaseAssets[0].aspectRatio, 0.5)
    assert.equal(selected.showcaseAssets[1].aspectRatio, 720 / 1280)
    assert.equal(selected.showcaseAssets[2].aspectRatio, 1)
    assert.equal(selected.showcaseAssets[2].preview?.alt, 'animation-one-preview preview')
    assert.deepEqual(detail, snapshot)
  })

  it('reports identity and required-collection configuration failures', () => {
    const cases: Array<[ServicesPageConfigurationIssueCode, ServiceDetail, ServiceSummary[]?]> = [
      ['detail-service-mismatch', createDetail({ id: 'unexpected-id' })],
      ['missing-capabilities', createDetail({ capabilities: [] })],
      ['missing-tools', createDetail({ tools: [] })],
      ['missing-related-projects', createDetail({ relatedProjects: [] })],
      ['missing-showcase', createDetail({ showcaseAssets: [] })],
    ]

    for (const [expectedCode, detail, services] of cases) {
      assert.equal(getIssueCode(detail, services), expectedCode)
    }
  })

  it('reports invalid tool, project, and showcase data without static fallbacks', () => {
    const unknownTool = createDetail({
      tools: [{ key: 'unknown-tool' as ServiceToolKey, label: 'Unknown' }],
    })
    const invalidLogo = createDetail()
    invalidLogo.relatedProjects[0].logo.width = 0
    const invalidImage = createDetail()
    invalidImage.showcaseAssets[0].height = null
    const missingPreview = createDetail()
    missingPreview.showcaseAssets[1].preview = null
    const invalidPreview = createDetail()
    if (invalidPreview.showcaseAssets[2].preview) {
      invalidPreview.showcaseAssets[2].preview.height = 0
    }
    const partialMotionDimensions = createDetail()
    partialMotionDimensions.showcaseAssets[2].width = 800
    const unknownKind = createDetail()
    unknownKind.showcaseAssets[0].kind = 'unknown' as 'image'

    const cases: Array<[ServicesPageConfigurationIssueCode, ServiceDetail]> = [
      ['unknown-service-tool', unknownTool],
      ['invalid-project-logo-dimensions', invalidLogo],
      ['invalid-showcase-dimensions', invalidImage],
      ['missing-motion-preview', missingPreview],
      ['invalid-preview-dimensions', invalidPreview],
      ['invalid-showcase-dimensions', partialMotionDimensions],
      ['unknown-showcase-kind', unknownKind],
    ]

    for (const [expectedCode, detail] of cases) {
      assert.equal(getIssueCode(detail), expectedCode)
    }
  })
})

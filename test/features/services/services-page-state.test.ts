import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ApiError } from '../../../src/api/api-error.ts'
import type {
  ServiceDetail,
  ServiceSummary,
} from '../../../src/features/services/model/service.types.ts'
import type { ServicePresentationAssets } from '../../../src/features/services/presentation/services-page.ts'
import {
  getServicesRequestErrorMessage,
  isServiceNotFoundError,
  resolveServiceRouteState,
  resolveServicesIndexState,
} from '../../../src/features/services/presentation/services-page-state.ts'

const testAssets: ServicePresentationAssets = {
  icons: {
    'product-ui-ux': { src: '/product.svg', width: 85, height: 83 },
    'mobile-development': { src: '/mobile.svg', width: 60, height: 85 },
    'web-development': { src: '/web.svg', width: 85, height: 75 },
    'backend-development': { src: '/backend.svg', width: 84, height: 84 },
  },
  tones: {
    product: { key: 'product', color: 'product-color', surfaceColor: 'product-surface' },
    mobile: { key: 'mobile', color: 'mobile-color', surfaceColor: 'mobile-surface' },
    web: { key: 'web', color: 'web-color', surfaceColor: 'web-surface' },
    backend: { key: 'backend', color: 'backend-color', surfaceColor: 'backend-surface' },
  },
  tools: {
    jitter: { src: '/jitter.svg', width: 61, height: 61 },
    rive: { src: '/rive.svg', width: 61, height: 61 },
    figma: { src: '/figma.svg', width: 61, height: 61 },
    react: { src: '/react.svg', width: 61, height: 61 },
    typescript: { src: '/typescript.svg', width: 61, height: 61 },
    expo: { src: '/expo.svg', width: 61, height: 61 },
    nextjs: { src: '/nextjs.svg', width: 61, height: 61 },
    wordpress: { src: '/wordpress.svg', width: 61, height: 61 },
    vercel: { src: '/vercel.svg', width: 61, height: 61 },
    nestjs: { src: '/nestjs.svg', width: 61, height: 61 },
    postgresql: { src: '/postgresql.svg', width: 61, height: 61 },
    prisma: { src: '/prisma.svg', width: 61, height: 61 },
  },
}

function createService(id: string): ServiceSummary {
  return {
    id,
    slug: id,
    title: `Service ${id}`,
    description: `${id} description`,
    icon: 'web-development',
    tone: 'web',
    home: { featured: true },
  }
}

function createDetail(id: string): ServiceDetail {
  return {
    ...createService(id),
    capabilities: [`${id} capability`],
    tools: [{ key: 'typescript', label: 'TypeScript' }],
    relatedProjects: [
      {
        id: `${id}-project`,
        slug: `${id}-project`,
        title: `${id} project`,
        logo: {
          id: `${id}-logo`,
          url: `https://cdn.example.test/${id}-logo.webp`,
          alt: `${id} logo`,
          width: 512,
          height: 512,
        },
      },
    ],
    showcaseAssets: [
      {
        id: `${id}-showcase`,
        kind: 'image',
        format: 'webp',
        url: `https://cdn.example.test/${id}-showcase.webp`,
        alt: `${id} showcase`,
        width: 800,
        height: 1200,
        duration: null,
        preview: null,
      },
    ],
  }
}

describe('Services index route state', () => {
  it('preserves loading and errors before exposing the backend-ordered list', () => {
    assert.deepEqual(resolveServicesIndexState({ status: 'loading' }, testAssets), { status: 'loading' })
    assert.deepEqual(resolveServicesIndexState({ status: 'error', message: 'Unavailable' }, testAssets), {
      status: 'error',
      message: 'Unavailable',
    })

    const services = [createService('first'), createService('second')]
    const result = resolveServicesIndexState({ status: 'ready', services }, testAssets)
    assert.equal(result.status, 'ready')
    assert.deepEqual(
      result.status === 'ready' ? result.presentation.services.map(({ slug }) => slug) : [],
      ['first', 'second'],
    )
  })

  it('keeps an empty index instead of redirecting to a detail route', () => {
    assert.deepEqual(resolveServicesIndexState({ status: 'ready', services: [] }, testAssets), {
      status: 'empty',
    })
  })
})

describe('Service detail route state', () => {
  const services = [createService('first'), createService('second')]

  it('prioritizes list loading and errors while direct detail loading runs in parallel', () => {
    assert.deepEqual(
      resolveServiceRouteState(
        'first',
        { status: 'loading' },
        { status: 'ready', service: createDetail('first') },
        testAssets,
      ),
      { status: 'services-loading' },
    )
    assert.deepEqual(
      resolveServiceRouteState(
        'first',
        { status: 'error', message: 'List failed' },
        { status: 'ready', service: createDetail('first') },
        testAssets,
      ),
      { status: 'services-error', message: 'List failed' },
    )
  })

  it('distinguishes an empty archive and an unknown slug', () => {
    assert.deepEqual(
      resolveServiceRouteState(
        'first',
        { status: 'ready', services: [] },
        { status: 'ready', service: createDetail('first') },
        testAssets,
      ),
      { status: 'empty' },
    )

    const state = resolveServiceRouteState(
      'missing',
      { status: 'ready', services },
      { status: 'loading' },
      testAssets,
    )
    assert.equal(state.status, 'not-found')
    assert.equal(state.status === 'not-found' ? state.services : null, services)
  })

  it('keeps the ordered list available while detail loads or fails', () => {
    assert.deepEqual(
      resolveServiceRouteState(
        'first',
        { status: 'ready', services },
        { status: 'loading' },
        testAssets,
      ),
      { status: 'detail-loading', services, slug: 'first' },
    )
    assert.deepEqual(
      resolveServiceRouteState(
        'first',
        { status: 'ready', services },
        { status: 'error', message: 'Detail failed', notFound: false },
        testAssets,
      ),
      { status: 'detail-error', services, slug: 'first', message: 'Detail failed' },
    )
  })

  it('maps a detail 404 to the same intentional not-found state', () => {
    assert.deepEqual(
      resolveServiceRouteState(
        'first',
        { status: 'ready', services },
        { status: 'error', message: 'Service not found', notFound: true },
        testAssets,
      ),
      { status: 'not-found', services, slug: 'first' },
    )
  })

  it('returns ready only when list and detail identity match', () => {
    const detail = createDetail('second')
    assert.deepEqual(
      resolveServiceRouteState(
        'second',
        { status: 'ready', services },
        { status: 'ready', service: detail },
        testAssets,
      ),
      {
        status: 'ready',
        presentation: {
          services: services.map((service) => ({
            id: service.id,
            slug: service.slug,
            title: service.title,
            description: service.description,
            icon: testAssets.icons['web-development'],
            tone: testAssets.tones.web,
          })),
          selectedService: {
            id: detail.id,
            slug: detail.slug,
            title: detail.title,
            description: detail.description,
            icon: testAssets.icons['web-development'],
            tone: testAssets.tones.web,
            capabilities: detail.capabilities,
            tools: [
              {
                ...detail.tools[0],
                icon: testAssets.tools.typescript,
              },
            ],
            relatedProjects: [
              {
                ...detail.relatedProjects[0],
                logo: {
                  ...detail.relatedProjects[0].logo,
                  aspectRatio: 1,
                },
              },
            ],
            showcaseAssets: [
              {
                ...detail.showcaseAssets[0],
                width: 800,
                height: 1200,
                aspectRatio: 2 / 3,
              },
            ],
          },
        },
      },
    )

    const mismatchedDetail = { ...createDetail('second'), id: 'reused-id' }
    const mismatch = resolveServiceRouteState(
      'second',
      { status: 'ready', services },
      { status: 'ready', service: mismatchedDetail },
      testAssets,
    )
    assert.equal(mismatch.status, 'configuration-error')
    assert.equal(
      mismatch.status === 'configuration-error' ? mismatch.issue.code : null,
      'detail-service-mismatch',
    )
  })
})

describe('Services request errors', () => {
  it('normalizes network and invalid-response failures', () => {
    assert.equal(
      getServicesRequestErrorMessage(new ApiError('fetch failed', { kind: 'network' })),
      'The Services API is unavailable right now. Please try again.',
    )
    assert.equal(
      getServicesRequestErrorMessage(new ApiError('Invalid data', { kind: 'invalid-response' })),
      'The Services API returned an unexpected response. Please try again.',
    )
  })

  it('recognizes only an HTTP 404 as a missing Service', () => {
    assert.equal(
      isServiceNotFoundError(new ApiError('Service not found', { kind: 'http', status: 404 })),
      true,
    )
    assert.equal(
      isServiceNotFoundError(new ApiError('Unavailable', { kind: 'http', status: 503 })),
      false,
    )
    assert.equal(isServiceNotFoundError(new Error('Service not found')), false)
  })
})

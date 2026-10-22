import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'

import { ApiError } from '../../../src/api/api-error.ts'
import {
  getHomeServices,
  getServiceBySlug,
  getServices,
} from '../../../src/features/services/api/services-api.ts'
import type {
  ServiceDetail,
  ServiceSummary,
} from '../../../src/features/services/model/service.types.ts'

const originalFetch = globalThis.fetch

const service: ServiceSummary = {
  id: 'service-1',
  slug: 'product-ui-ux',
  title: 'Product & UI/UX Design',
  description: 'A synthetic service fixture.',
  icon: 'product-ui-ux',
  tone: 'product',
  home: { featured: true },
}

const serviceDetail: ServiceDetail = {
  ...service,
  capabilities: ['First capability', 'Second capability'],
  tools: [
    { key: 'jitter', label: 'Jitter' },
    { key: 'rive', label: 'Rive' },
    { key: 'figma', label: 'Figma' },
  ],
  relatedProjects: [
    {
      id: 'project-1',
      slug: 'project-alpha',
      title: 'Project Alpha',
      logo: {
        id: 'logo-1',
        url: 'https://cdn.example.test/project-alpha-logo.webp',
        alt: 'Project Alpha logo',
        width: 512,
        height: 512,
      },
    },
  ],
  showcaseAssets: [
    {
      id: 'showcase-image',
      kind: 'image',
      format: 'webp',
      url: 'https://cdn.example.test/showcase.webp',
      alt: 'Synthetic service showcase',
      width: 800,
      height: 1200,
      duration: null,
      preview: null,
    },
    {
      id: 'showcase-animation',
      kind: 'animation',
      format: 'riv',
      url: 'https://cdn.example.test/showcase.riv',
      alt: 'Synthetic service animation',
      width: null,
      height: null,
      duration: null,
      preview: {
        id: 'showcase-animation-preview',
        url: 'https://cdn.example.test/showcase-preview.webp',
        alt: 'Synthetic animation preview',
        width: 800,
        height: 800,
      },
    },
  ],
}

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('Services API', () => {
  it('loads the Services-page list without changing backend order', async () => {
    const services = [
      service,
      { ...service, id: 'service-2', slug: 'mobile-development', title: 'Mobile Development' },
    ]
    let requestedInput: RequestInfo | URL | undefined

    globalThis.fetch = async (input) => {
      requestedInput = input
      return jsonResponse({
        success: true,
        message: 'Services retrieved successfully.',
        data: services,
      })
    }

    const result = await getServices()

    assert.equal(requestedInput, '/api/v1/services')
    assert.deepEqual(result.map(({ slug }) => slug), ['product-ui-ux', 'mobile-development'])
  })

  it('requests Home placement and forwards the AbortSignal', async () => {
    const controller = new AbortController()
    let requestedInput: RequestInfo | URL | undefined
    let requestedSignal: AbortSignal | null | undefined

    globalThis.fetch = async (input, init) => {
      requestedInput = input
      requestedSignal = init?.signal
      return jsonResponse({
        success: true,
        message: 'Services retrieved successfully.',
        data: [service],
      })
    }

    await getHomeServices({ signal: controller.signal })

    assert.equal(requestedInput, '/api/v1/services?placement=home')
    assert.equal(requestedSignal, controller.signal)
  })

  it('loads encoded Service detail and preserves backend collection order', async () => {
    const controller = new AbortController()
    let requestCount = 0
    let requestedInput: RequestInfo | URL | undefined
    let requestedInit: RequestInit | undefined

    globalThis.fetch = async (input, init) => {
      requestCount += 1
      requestedInput = input
      requestedInit = init
      return jsonResponse({
        success: true,
        message: 'Service retrieved successfully.',
        data: serviceDetail,
      })
    }

    const result = await getServiceBySlug('service with spaces', {
      signal: controller.signal,
    })

    assert.equal(requestCount, 1)
    assert.equal(requestedInput, '/api/v1/services/service%20with%20spaces')
    assert.equal(requestedInit?.signal, controller.signal)
    assert.deepEqual(requestedInit?.headers, { Accept: 'application/json' })
    assert.deepEqual(result.capabilities, ['First capability', 'Second capability'])
    assert.deepEqual(result.tools.map(({ key }) => key), ['jitter', 'rive', 'figma'])
    assert.deepEqual(result.relatedProjects.map(({ slug }) => slug), ['project-alpha'])
    assert.deepEqual(result.showcaseAssets.map(({ id }) => id), [
      'showcase-image',
      'showcase-animation',
    ])
    assert.equal(result.showcaseAssets[0].duration, null)
    assert.equal(result.showcaseAssets[1].width, null)
    assert.deepEqual(result.showcaseAssets[1].preview, serviceDetail.showcaseAssets[1].preview)
  })

  it('rejects an empty Service slug before making a request', () => {
    let requestCount = 0
    globalThis.fetch = async () => {
      requestCount += 1
      return jsonResponse({})
    }

    assert.throws(() => getServiceBySlug('   '), {
      name: 'TypeError',
      message: 'Service slug is required.',
    })
    assert.equal(requestCount, 0)
  })

  it('preserves a safe backend 404 as a normalized API error', async () => {
    globalThis.fetch = async () =>
      jsonResponse({ success: false, message: 'Service not found' }, { status: 404 })

    await assert.rejects(getServiceBySlug('missing-service'), (error: unknown) => {
      assert.equal(error instanceof ApiError, true)
      if (!(error instanceof ApiError)) return false

      assert.equal(error.kind, 'http')
      assert.equal(error.status, 404)
      assert.equal(error.message, 'Service not found')
      return true
    })
  })
})

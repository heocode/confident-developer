import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ApiError } from '../../../src/api/api-error.ts'
import type {
  ServiceDetail,
  ServiceSummary,
} from '../../../src/features/services/model/service.types.ts'
import {
  getServicesRequestErrorMessage,
  isServiceNotFoundError,
  resolveServiceRouteState,
  resolveServicesIndexState,
} from '../../../src/features/services/presentation/services-page-state.ts'

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
    assert.deepEqual(resolveServicesIndexState({ status: 'loading' }), { status: 'loading' })
    assert.deepEqual(resolveServicesIndexState({ status: 'error', message: 'Unavailable' }), {
      status: 'error',
      message: 'Unavailable',
    })

    const services = [createService('first'), createService('second')]
    assert.deepEqual(resolveServicesIndexState({ status: 'ready', services }), {
      status: 'ready',
      services,
    })
  })

  it('keeps an empty index instead of redirecting to a detail route', () => {
    assert.deepEqual(resolveServicesIndexState({ status: 'ready', services: [] }), {
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
      ),
      { status: 'services-loading' },
    )
    assert.deepEqual(
      resolveServiceRouteState(
        'first',
        { status: 'error', message: 'List failed' },
        { status: 'ready', service: createDetail('first') },
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
      ),
      { status: 'empty' },
    )

    const state = resolveServiceRouteState(
      'missing',
      { status: 'ready', services },
      { status: 'loading' },
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
      ),
      { status: 'detail-loading', services, slug: 'first' },
    )
    assert.deepEqual(
      resolveServiceRouteState(
        'first',
        { status: 'ready', services },
        { status: 'error', message: 'Detail failed', notFound: false },
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
      ),
      { status: 'ready', services, service: detail },
    )

    const mismatchedDetail = { ...createDetail('second'), id: 'reused-id' }
    const mismatch = resolveServiceRouteState(
      'second',
      { status: 'ready', services },
      { status: 'ready', service: mismatchedDetail },
    )
    assert.equal(mismatch.status, 'detail-error')
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

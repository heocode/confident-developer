import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'

import {
  createServiceDetailCache,
  prefetchServiceDetail,
} from '../../../src/features/services/hooks/useServicesPageData.ts'
import type { ServiceDetail } from '../../../src/features/services/model/service.types.ts'

const originalFetch = globalThis.fetch

const service: ServiceDetail = {
  capabilities: ['API architecture'],
  description: 'A cache fixture.',
  home: { featured: true },
  icon: 'backend-development',
  id: 'backend-service',
  relatedProjects: [],
  showcaseAssets: [],
  slug: 'backend-architecture',
  title: 'Backend & Architecture',
  tone: 'backend',
  tools: [],
}

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('Service detail route-session cache', () => {
  it('shares one in-flight prefetch and promotes its result into the detail cache', async () => {
    let requestCount = 0
    globalThis.fetch = async () => {
      requestCount += 1
      return new Response(
        JSON.stringify({
          data: service,
          message: 'Service retrieved successfully.',
          success: true,
        }),
        { headers: { 'Content-Type': 'application/json' } },
      )
    }

    const cache = createServiceDetailCache()
    const firstRequest = prefetchServiceDetail(service.slug, cache)
    const secondRequest = prefetchServiceDetail(service.slug, cache)

    assert.equal(firstRequest, secondRequest)
    assert.deepEqual(await firstRequest, service)
    assert.equal(requestCount, 1)
    assert.deepEqual(cache.details.get(service.slug), service)
    assert.equal(cache.prefetchedRequests.has(service.slug), false)
  })
})

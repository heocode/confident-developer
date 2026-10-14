import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'

import {
  getHomeServices,
  getServices,
} from '../../../src/features/services/api/services-api.ts'
import type { PublicService } from '../../../src/features/services/model/service.types.ts'

const originalFetch = globalThis.fetch

const service: PublicService = {
  id: 'service-1',
  slug: 'product-ui-ux',
  title: 'Product & UI/UX Design',
  description: 'A synthetic service fixture.',
  icon: 'product-ui-ux',
  tone: 'product',
  home: { featured: true },
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
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
})

import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'

import { ApiError } from '../../../src/api/api-error.ts'
import {
  getHomeProjects,
  getProjectBySlug,
  getProjects,
} from '../../../src/features/projects/api/projects-api.ts'
import type { PublicProject } from '../../../src/features/projects/model/project.types.ts'

const originalFetch = globalThis.fetch

const project: PublicProject = {
  id: 'project-1',
  slug: 'project-alpha',
  title: 'Project Alpha',
  tagline: 'A synthetic project fixture',
  summary: 'Test-only content that does not duplicate backend records.',
  position: 'Developer',
  themeColor: '#336699',
  projectsPageTheme: { tabColor: '#15418A', panelColor: '#394E70' },
  timeline: {
    startDate: '2026-06-01T00:00:00.000Z',
    endDate: null,
  },
  home: {
    featured: true,
    primary: true,
  },
  buildBreakdown: [
    { id: 'breakdown-1', label: 'Development', percentage: 100 },
  ],
  logo: {
    id: 'logo-1',
    url: 'https://cdn.example.test/logo.webp',
    alt: 'Project Alpha logo',
    width: 512,
    height: 512,
  },
  homePreview: {
    id: 'preview-1',
    url: 'https://cdn.example.test/preview.webp',
    alt: 'Project Alpha preview',
    width: 1200,
    height: 1600,
  },
  links: [
    { id: 'link-1', label: 'Website', url: 'https://example.com', icon: 'website' },
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

describe('Projects API', () => {
  it('loads the Projects-page list without changing backend order', async () => {
    const projects = [project, { ...project, id: 'project-2', slug: 'project-beta', title: 'Project Beta' }]
    let requestedInput: RequestInfo | URL | undefined
    let requestedInit: RequestInit | undefined

    globalThis.fetch = async (input, init) => {
      requestedInput = input
      requestedInit = init
      return jsonResponse({ success: true, message: 'Projects retrieved successfully.', data: projects })
    }

    const result = await getProjects()

    assert.equal(requestedInput, '/api/v1/projects')
    assert.equal(requestedInit?.method, 'GET')
    assert.equal(requestedInit?.credentials, 'same-origin')
    assert.deepEqual(requestedInit?.headers, { Accept: 'application/json' })
    assert.deepEqual(result.map(({ slug }) => slug), ['project-alpha', 'project-beta'])
    assert.deepEqual(result[0]?.projectsPageTheme, {
      tabColor: '#15418A',
      panelColor: '#394E70',
    })
  })

  it('requests Home placement and forwards the AbortSignal', async () => {
    const controller = new AbortController()
    let requestedInput: RequestInfo | URL | undefined
    let requestedSignal: AbortSignal | null | undefined

    globalThis.fetch = async (input, init) => {
      requestedInput = input
      requestedSignal = init?.signal
      return jsonResponse({ success: true, message: 'Projects retrieved successfully.', data: [project] })
    }

    await getHomeProjects({ signal: controller.signal })

    assert.equal(requestedInput, '/api/v1/projects?placement=home')
    assert.equal(requestedSignal, controller.signal)
  })

  it('encodes the selected slug and returns project detail', async () => {
    let requestedInput: RequestInfo | URL | undefined
    const detail = { ...project, scope: 'Product design and development.', screenshots: [] }

    globalThis.fetch = async (input) => {
      requestedInput = input
      return jsonResponse({ success: true, message: 'Project retrieved successfully.', data: detail })
    }

    const result = await getProjectBySlug('project with spaces')

    assert.equal(requestedInput, '/api/v1/projects/project%20with%20spaces')
    assert.equal(result.scope, detail.scope)
  })

  it('uses the safe backend message for non-successful responses', async () => {
    globalThis.fetch = async () =>
      jsonResponse({ success: false, message: 'Project not found' }, { status: 404 })

    await assert.rejects(getProjectBySlug('missing-project'), (error: unknown) => {
      assert.ok(error instanceof ApiError)
      assert.equal(error.kind, 'http')
      assert.equal(error.status, 404)
      assert.equal(error.message, 'Project not found')
      return true
    })
  })

  it('rejects malformed successful responses', async () => {
    globalThis.fetch = async () => jsonResponse({ success: true, message: 'Missing data' })

    await assert.rejects(getProjects(), (error: unknown) => {
      assert.ok(error instanceof ApiError)
      assert.equal(error.kind, 'invalid-response')
      return true
    })
  })

  it('normalizes network failures without swallowing aborts', async () => {
    globalThis.fetch = async () => {
      throw new TypeError('fetch failed')
    }

    await assert.rejects(getProjects(), (error: unknown) => {
      assert.ok(error instanceof ApiError)
      assert.equal(error.kind, 'network')
      assert.equal(error.message, 'Unable to reach the API.')
      return true
    })

    const abortError = new DOMException('The operation was aborted.', 'AbortError')
    globalThis.fetch = async () => {
      throw abortError
    }

    await assert.rejects(getProjects(), (error: unknown) => error === abortError)
  })
})

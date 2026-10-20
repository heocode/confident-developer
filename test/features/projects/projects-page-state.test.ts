import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ApiError } from '../../../src/api/api-error.ts'
import type {
  PublicMedia,
  PublicProject,
  PublicProjectDetail,
} from '../../../src/features/projects/model/project.types.ts'
import {
  getProjectsRequestErrorMessage,
  isProjectNotFoundError,
  resolveProjectRouteState,
  resolveProjectsIndexState,
} from '../../../src/features/projects/presentation/projects-page-state.ts'

function createMedia(id: string): PublicMedia {
  return {
    id,
    url: `https://cdn.example.test/${id}.webp`,
    alt: `${id} alt`,
    width: 632,
    height: 632,
  }
}

function createProject(id: string): PublicProject {
  return {
    id,
    slug: id,
    title: `Project ${id}`,
    tagline: `${id} tagline`,
    summary: `${id} summary`,
    position: 'Developer',
    themeColor: '#336699',
    projectsPageTheme: { tabColor: '#15418A', panelColor: '#394E70' },
    timeline: { startDate: '2026-06-01T00:00:00.000Z', endDate: null },
    home: { featured: true, primary: false },
    buildBreakdown: [],
    logo: createMedia(`${id}-logo`),
    homePreview: null,
    links: [],
  }
}

function createDetail(id: string): PublicProjectDetail {
  return {
    ...createProject(id),
    scope: `${id} scope`,
    screenshots: [{ ...createMedia(`${id}-screenshot`), width: 490, height: 1060 }],
  }
}

describe('Projects index route state', () => {
  it('preserves loading and error states before redirecting to the first backend project', () => {
    assert.deepEqual(resolveProjectsIndexState({ status: 'loading' }), { status: 'loading' })
    assert.deepEqual(resolveProjectsIndexState({ status: 'error', message: 'Unavailable' }), {
      status: 'error',
      message: 'Unavailable',
    })
    assert.deepEqual(
      resolveProjectsIndexState({
        status: 'ready',
        projects: [createProject('first'), createProject('second')],
      }),
      { status: 'redirect', slug: 'first' },
    )
  })

  it('returns an intentional empty state without redirecting', () => {
    assert.deepEqual(resolveProjectsIndexState({ status: 'ready', projects: [] }), {
      status: 'empty',
    })
  })
})

describe('Project detail route state', () => {
  const projects = [createProject('first'), createProject('second')]

  it('prioritizes the list request because tabs require the ordered collection', () => {
    assert.deepEqual(
      resolveProjectRouteState('first', { status: 'loading' }, { status: 'ready', project: createDetail('first') }),
      { status: 'projects-loading' },
    )
    assert.deepEqual(
      resolveProjectRouteState(
        'first',
        { status: 'error', message: 'List failed' },
        { status: 'ready', project: createDetail('first') },
      ),
      { status: 'projects-error', message: 'List failed' },
    )
  })

  it('distinguishes empty collections and unknown slugs', () => {
    assert.deepEqual(
      resolveProjectRouteState(
        'first',
        { status: 'ready', projects: [] },
        { status: 'ready', project: createDetail('first') },
      ),
      { status: 'empty' },
    )

    const state = resolveProjectRouteState(
      'missing',
      { status: 'ready', projects },
      { status: 'loading' },
    )
    assert.equal(state.status, 'not-found')
    assert.equal(state.status === 'not-found' ? state.projects : null, projects)
  })

  it('keeps the ordered list available while detail loads or fails', () => {
    const loading = resolveProjectRouteState(
      'first',
      { status: 'ready', projects },
      { status: 'loading' },
    )
    assert.equal(loading.status, 'detail-loading')
    assert.equal(loading.status === 'detail-loading' ? loading.projects : null, projects)

    assert.deepEqual(
      resolveProjectRouteState(
        'first',
        { status: 'ready', projects },
        { status: 'error', message: 'Detail failed', notFound: false },
      ),
      { status: 'detail-error', projects, slug: 'first', message: 'Detail failed' },
    )
  })

  it('maps a detail 404 to the same intentional not-found state', () => {
    assert.deepEqual(
      resolveProjectRouteState(
        'first',
        { status: 'ready', projects },
        { status: 'error', message: 'Project not found', notFound: true },
      ),
      { status: 'not-found', projects, slug: 'first' },
    )
  })

  it('returns the complete presentation only when both requests are consistent', () => {
    const state = resolveProjectRouteState(
      'second',
      { status: 'ready', projects },
      { status: 'ready', project: createDetail('second') },
    )

    assert.equal(state.status, 'ready')
    if (state.status !== 'ready') return
    assert.deepEqual(state.presentation.tabs.map(({ slug }) => slug), ['first', 'second'])
    assert.equal(state.presentation.selectedProject?.slug, 'second')
  })

  it('surfaces published-content configuration problems separately from transport errors', () => {
    const detail = { ...createDetail('first'), projectsPageTheme: null }
    const state = resolveProjectRouteState(
      'first',
      { status: 'ready', projects },
      { status: 'ready', project: detail },
    )

    assert.equal(state.status, 'configuration-error')
    assert.equal(
      state.status === 'configuration-error' ? state.issue.code : null,
      'missing-projects-page-theme',
    )
  })
})

describe('Projects request errors', () => {
  it('normalizes network and invalid-response failures', () => {
    assert.equal(
      getProjectsRequestErrorMessage(new ApiError('fetch failed', { kind: 'network' })),
      'The projects service is unavailable right now. Please try again.',
    )
    assert.equal(
      getProjectsRequestErrorMessage(new ApiError('Invalid data', { kind: 'invalid-response' })),
      'The projects service returned an unexpected response. Please try again.',
    )
  })

  it('recognizes only an HTTP 404 as a missing project', () => {
    assert.equal(
      isProjectNotFoundError(new ApiError('Project not found', { kind: 'http', status: 404 })),
      true,
    )
    assert.equal(
      isProjectNotFoundError(new ApiError('Unavailable', { kind: 'http', status: 503 })),
      false,
    )
    assert.equal(isProjectNotFoundError(new Error('Project not found')), false)
  })
})

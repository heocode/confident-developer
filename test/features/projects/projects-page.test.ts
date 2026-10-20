import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type {
  PublicMedia,
  PublicProject,
  PublicProjectDetail,
} from '../../../src/features/projects/model/project.types.ts'
import { createProjectsPagePresentation } from '../../../src/features/projects/presentation/projects-page.ts'

function createMedia(id: string, width = 400, height = 200): PublicMedia {
  return {
    id,
    url: `https://cdn.example.test/${id}.webp`,
    alt: `${id} alt`,
    width,
    height,
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
    logo: createMedia(`${id}-logo`, 632, 632),
    homePreview: null,
    links: [],
  }
}

function createDetail(id: string): PublicProjectDetail {
  return {
    ...createProject(id),
    scope: `${id} scope`,
    links: [
      { id: 'website-link', label: 'Website', url: 'https://example.test', icon: 'website' },
      { id: 'github-link', label: 'GitHub', url: 'https://github.com/example', icon: 'github' },
    ],
    screenshots: [
      createMedia('portrait', 490, 1060),
      createMedia('landscape', 1070, 1060),
    ],
  }
}

describe('Projects page presentation', () => {
  it('preserves backend order and maps the selected project for rendering', () => {
    const projects = [createProject('first'), createProject('second'), createProject('third')]
    const detail = createDetail('second')

    const result = createProjectsPagePresentation(projects, detail)

    assert.ok(result)
    assert.deepEqual(result.tabs.map(({ slug }) => slug), ['first', 'second', 'third'])
    assert.equal(result.tabs[0].logo.aspectRatio, 1)
    assert.equal(result.configurationIssue, null)
    assert.equal(result.selectedProject?.slug, 'second')
    assert.equal(result.selectedProject?.scope, 'second scope')
    assert.equal(result.selectedProject?.timeline, 'Jun 2026 - Ongoing')
    assert.deepEqual(result.selectedProject?.theme, {
      tabColor: '#15418A',
      panelColor: '#394E70',
    })
    assert.deepEqual(result.selectedProject?.links.map(({ id }) => id), ['website-link', 'github-link'])
    assert.deepEqual(result.selectedProject?.screenshots.map(({ id }) => id), ['portrait', 'landscape'])
    assert.equal(result.selectedProject?.screenshots[0].aspectRatio, 490 / 1060)
    assert.equal(result.selectedProject?.screenshots[1].aspectRatio, 1070 / 1060)
  })

  it('does not mutate API arrays while creating presentation values', () => {
    const projects = [createProject('first')]
    const detail = createDetail('first')

    const result = createProjectsPagePresentation(projects, detail)

    assert.ok(result?.selectedProject)
    assert.notEqual(result.tabs, projects)
    assert.notEqual(result.selectedProject.links, detail.links)
    assert.notEqual(result.selectedProject.screenshots, detail.screenshots)
    assert.deepEqual(detail.screenshots.map((screenshot) => Object.keys(screenshot).includes('aspectRatio')), [false, false])
  })

  it('returns null when the ordered project list is empty', () => {
    assert.equal(createProjectsPagePresentation([], createDetail('first')), null)
  })

  it('reports detail that does not belong to the ordered list', () => {
    const result = createProjectsPagePresentation([createProject('first')], createDetail('missing'))

    assert.ok(result)
    assert.equal(result.selectedProject, null)
    assert.deepEqual(result.configurationIssue, {
      code: 'detail-project-mismatch',
      projectSlug: 'missing',
    })
  })

  it('reports a reused slug with a different public project ID', () => {
    const detail = { ...createDetail('first'), id: 'different-id' }
    const result = createProjectsPagePresentation([createProject('first')], detail)

    assert.ok(result)
    assert.equal(result.configurationIssue?.code, 'detail-project-mismatch')
  })

  it('requires an explicit Projects-page theme without deriving a slug palette', () => {
    const detail = { ...createDetail('first'), projectsPageTheme: null }
    const result = createProjectsPagePresentation([createProject('first')], detail)

    assert.ok(result)
    assert.equal(result.selectedProject, null)
    assert.deepEqual(result.configurationIssue, {
      code: 'missing-projects-page-theme',
      projectSlug: 'first',
    })
  })

  it('reports an empty screenshot collection', () => {
    const detail = { ...createDetail('first'), screenshots: [] }
    const result = createProjectsPagePresentation([createProject('first')], detail)

    assert.ok(result)
    assert.deepEqual(result.configurationIssue, {
      code: 'missing-screenshots',
      projectSlug: 'first',
    })
  })

  it('reports invalid screenshot dimensions with the affected media ID', () => {
    for (const screenshot of [createMedia('zero-width', 0, 100), createMedia('invalid-height', 100, Number.NaN)]) {
      const detail = { ...createDetail('first'), screenshots: [screenshot] }
      const result = createProjectsPagePresentation([createProject('first')], detail)

      assert.ok(result)
      assert.deepEqual(result.configurationIssue, {
        code: 'invalid-media-dimensions',
        projectSlug: 'first',
        mediaId: screenshot.id,
      })
    }
  })

  it('reports invalid logo dimensions without dropping or reordering tabs', () => {
    const first = createProject('first')
    const second = {
      ...createProject('second'),
      logo: createMedia('second-logo', 632, -1),
    }
    const result = createProjectsPagePresentation([first, second], createDetail('first'))

    assert.ok(result)
    assert.deepEqual(result.tabs.map(({ slug }) => slug), ['first', 'second'])
    assert.equal(result.tabs[1].logo.aspectRatio, null)
    assert.deepEqual(result.configurationIssue, {
      code: 'invalid-media-dimensions',
      projectSlug: 'second',
      mediaId: 'second-logo',
    })
  })
})

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { PublicProject } from '../../../src/features/projects/model/project.types.ts'
import { createHomeProjectsPresentation } from '../../../src/features/projects/presentation/home-projects.ts'

function createProject(id: string, primary = false): PublicProject {
  return {
    id,
    slug: id,
    title: id,
    tagline: `${id} tagline`,
    summary: `${id} summary`,
    position: 'Developer',
    themeColor: null,
    timeline: { startDate: '2026-01-01T00:00:00.000Z', endDate: null },
    home: { featured: true, primary },
    buildBreakdown: [],
    logo: { id: `${id}-logo`, url: 'https://cdn.example.test/logo.svg', alt: '', width: 100, height: 100 },
    homePreview: null,
    links: [],
  }
}

describe('Home projects presentation', () => {
  it('preserves backend order and selects the configured primary project', () => {
    const projects = [createProject('first'), createProject('second', true), createProject('third')]

    const result = createHomeProjectsPresentation(projects)

    assert.ok(result)
    assert.equal(result.projects, projects)
    assert.deepEqual(result.projects.map(({ id }) => id), ['first', 'second', 'third'])
    assert.equal(result.primaryProjectId, 'second')
    assert.equal(result.configurationIssue, null)
  })

  it('uses the first backend project when no primary is configured', () => {
    const result = createHomeProjectsPresentation([createProject('first'), createProject('second')])

    assert.ok(result)
    assert.equal(result.primaryProjectId, 'first')
    assert.equal(result.configurationIssue, 'missing-primary')
  })

  it('uses the first configured primary without reordering when multiple projects are primary', () => {
    const result = createHomeProjectsPresentation([
      createProject('first', true),
      createProject('second'),
      createProject('third', true),
    ])

    assert.ok(result)
    assert.equal(result.primaryProjectId, 'first')
    assert.equal(result.configurationIssue, 'multiple-primary')
  })

  it('returns null for an empty response', () => {
    assert.equal(createHomeProjectsPresentation([]), null)
  })
})

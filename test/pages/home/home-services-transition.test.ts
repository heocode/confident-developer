import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getProjectsServicesTransitionState } from '../../../src/pages/home/utils/projects-services-transition.ts'

describe('Home Projects-to-Services transition', () => {
  it('keeps the section hidden before it enters the viewport', () => {
    assert.deepEqual(getProjectsServicesTransitionState(1_000, 1_000, 4), {
      progress: 0,
      projectsContentProgress: 1,
      serviceItemProgresses: [0, 0, 0, 0],
      servicesTitleProgress: 0,
    })
  })

  it('finishes before the Services section reaches the viewport top', () => {
    assert.deepEqual(getProjectsServicesTransitionState(50, 1_000, 4), {
      progress: 1,
      projectsContentProgress: 0,
      serviceItemProgresses: [1, 1, 1, 1],
      servicesTitleProgress: 1,
    })
  })

  it('creates a title-only phase between the two sections', () => {
    const transition = getProjectsServicesTransitionState(600, 1_000, 4)

    assert.equal(transition.projectsContentProgress, 0)
    assert.equal(transition.servicesTitleProgress, 1)
    assert.deepEqual(transition.serviceItemProgresses, [0, 0, 0, 0])
  })

  it('reveals the service rows sequentially after the title-only phase', () => {
    const transition = getProjectsServicesTransitionState(300, 1_000, 4)
    const [firstItem, secondItem, thirdItem, fourthItem] = transition.serviceItemProgresses

    assert.equal(transition.servicesTitleProgress, 1)
    assert.ok(firstItem > secondItem)
    assert.ok(secondItem > thirdItem)
    assert.ok(thirdItem > fourthItem)
  })

  it('creates progress values for the configured item count', () => {
    const transition = getProjectsServicesTransitionState(300, 1_000, 2)

    assert.equal(transition.serviceItemProgresses.length, 2)
  })

  it('falls back to the initial state for invalid viewport measurements', () => {
    assert.deepEqual(getProjectsServicesTransitionState(500, 0, 4), {
      progress: 0,
      projectsContentProgress: 1,
      serviceItemProgresses: [0, 0, 0, 0],
      servicesTitleProgress: 0,
    })
  })
})

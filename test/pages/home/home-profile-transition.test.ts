import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getServicesProfileTransitionState } from '../../../src/pages/home/utils/services-profile-transition.ts'

describe('Home Services-to-Profile transition', () => {
  it('keeps Profile content hidden before the section enters the viewport', () => {
    assert.deepEqual(getServicesProfileTransitionState(1_000, 1_000), {
      progress: 0,
      profileCardProgress: 0,
      profileTitleProgress: 0,
      servicesContentProgress: 1,
    })
  })

  it('finishes before the Profile section reaches the viewport top', () => {
    assert.deepEqual(getServicesProfileTransitionState(50, 1_000), {
      progress: 1,
      profileCardProgress: 1,
      profileTitleProgress: 1,
      servicesContentProgress: 0,
    })
  })

  it('creates a Profile title-only phase after Services content exits', () => {
    const transition = getServicesProfileTransitionState(600, 1_000)

    assert.equal(transition.servicesContentProgress, 0)
    assert.equal(transition.profileTitleProgress, 1)
    assert.equal(transition.profileCardProgress, 0)
  })

  it('reveals the card only after the title phase', () => {
    const titlePhase = getServicesProfileTransitionState(600, 1_000)
    const cardPhase = getServicesProfileTransitionState(300, 1_000)

    assert.equal(titlePhase.profileCardProgress, 0)
    assert.equal(cardPhase.profileTitleProgress, 1)
    assert.ok(cardPhase.profileCardProgress > 0)
  })

  it('falls back to the initial state for invalid viewport measurements', () => {
    assert.deepEqual(getServicesProfileTransitionState(500, 0), {
      progress: 0,
      profileCardProgress: 0,
      profileTitleProgress: 0,
      servicesContentProgress: 1,
    })
  })
})

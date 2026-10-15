import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getProfileReferencesTransitionState } from '../../../src/pages/home/utils/profile-references-transition.ts'

describe('Home Profile-to-References transition', () => {
  it('keeps References content hidden before the section enters the viewport', () => {
    assert.deepEqual(getProfileReferencesTransitionState(1_000, 1_000), {
      progress: 0,
      profileContentProgress: 1,
      referencesPanelProgress: 0,
      referencesTitleProgress: 0,
    })
  })

  it('finishes before the References section reaches the viewport top', () => {
    assert.deepEqual(getProfileReferencesTransitionState(50, 1_000), {
      progress: 1,
      profileContentProgress: 0,
      referencesPanelProgress: 1,
      referencesTitleProgress: 1,
    })
  })

  it('creates a References title-only phase after Profile content exits', () => {
    const transition = getProfileReferencesTransitionState(600, 1_000)

    assert.equal(transition.profileContentProgress, 0)
    assert.equal(transition.referencesTitleProgress, 1)
    assert.equal(transition.referencesPanelProgress, 0)
  })

  it('reveals the panel only after the title phase', () => {
    const titlePhase = getProfileReferencesTransitionState(600, 1_000)
    const panelPhase = getProfileReferencesTransitionState(300, 1_000)

    assert.equal(titlePhase.referencesPanelProgress, 0)
    assert.equal(panelPhase.referencesTitleProgress, 1)
    assert.ok(panelPhase.referencesPanelProgress > 0)
  })

  it('falls back to the initial state for invalid viewport measurements', () => {
    assert.deepEqual(getProfileReferencesTransitionState(500, 0), {
      progress: 0,
      profileContentProgress: 1,
      referencesPanelProgress: 0,
      referencesTitleProgress: 0,
    })
  })
})

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getHomeIntroTransitionState } from '../../../src/pages/home/utils/home-intro-transition.ts'

describe('Home intro transition', () => {
  it('keeps the Hero visible before the transition range', () => {
    assert.deepEqual(getHomeIntroTransitionState(300, 1_000), {
      heroOpacity: 1,
      progress: 0,
      projectCardProgresses: [0, 0, 0],
      projectsTitleProgress: 0,
    })
  })

  it('finishes when the Projects section reaches the viewport top', () => {
    assert.deepEqual(getHomeIntroTransitionState(1_000, 1_000), {
      heroOpacity: 0,
      progress: 1,
      projectCardProgresses: [1, 1, 1],
      projectsTitleProgress: 1,
    })
  })

  it('reveals project cards sequentially without changing their order', () => {
    const transition = getHomeIntroTransitionState(820, 1_000)
    const [firstCard, secondCard, thirdCard] = transition.projectCardProgresses

    assert.ok(Math.abs(transition.progress - 0.723_076_923) < 0.000_001)
    assert.equal(firstCard, 1)
    assert.ok(firstCard > secondCard)
    assert.ok(secondCard > thirdCard)
    assert.ok(thirdCard > 0)
  })

  it('returns the same phase values when revisiting a scroll position', () => {
    const firstVisit = getHomeIntroTransitionState(775, 1_000)
    getHomeIntroTransitionState(950, 1_000)
    const secondVisit = getHomeIntroTransitionState(775, 1_000)

    assert.deepEqual(secondVisit, firstVisit)
  })

  it('falls back to the initial state for invalid viewport measurements', () => {
    assert.deepEqual(getHomeIntroTransitionState(700, 0), {
      heroOpacity: 1,
      progress: 0,
      projectCardProgresses: [0, 0, 0],
      projectsTitleProgress: 0,
    })
  })
})

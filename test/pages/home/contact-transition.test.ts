import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getContactTransitionState } from '../../../src/pages/home/utils/contact-transition.ts'

describe('Home Contact transition', () => {
  it('keeps every Contact layer hidden before the section enters the viewport', () => {
    assert.deepEqual(getContactTransitionState(1_100, 1_000), {
      bottomProgress: 0,
      buttonProgress: 0,
      progress: 0,
      titleProgress: 0,
    })
  })

  it('reveals the title before the button', () => {
    const titlePhase = getContactTransitionState(500, 1_000)
    const buttonPhase = getContactTransitionState(350, 1_000)

    assert.ok(titlePhase.titleProgress > 0)
    assert.equal(titlePhase.buttonProgress, 0)
    assert.equal(titlePhase.bottomProgress, 0)
    assert.equal(buttonPhase.titleProgress, 1)
    assert.ok(buttonPhase.buttonProgress > 0)
    assert.equal(buttonPhase.bottomProgress, 0)
  })

  it('reveals the landscape and footer after the CTA button', () => {
    const bottomPhase = getContactTransitionState(100, 1_000)

    assert.equal(bottomPhase.titleProgress, 1)
    assert.equal(bottomPhase.buttonProgress, 1)
    assert.ok(bottomPhase.bottomProgress > 0)
  })

  it('finishes before the Contact section reaches the viewport top', () => {
    assert.deepEqual(getContactTransitionState(0, 1_000), {
      bottomProgress: 1,
      buttonProgress: 1,
      progress: 1,
      titleProgress: 1,
    })
  })

  it('falls back to the initial state for invalid viewport measurements', () => {
    assert.deepEqual(getContactTransitionState(Number.NaN, 0), {
      bottomProgress: 0,
      buttonProgress: 0,
      progress: 0,
      titleProgress: 0,
    })
  })
})

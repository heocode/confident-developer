import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  shouldCancelInitialHomeOpeningFromKey,
  shouldStartInitialHomeOpening,
} from '../../../src/components/layout/initial-home-opening.ts'

describe('Initial Home opening eligibility', () => {
  it('runs only for an initial Home document at the top', () => {
    assert.equal(
      shouldStartInitialHomeOpening({
        pathname: '/',
        prefersReducedMotion: false,
        scrollPosition: 0,
      }),
      true,
    )
    assert.equal(
      shouldStartInitialHomeOpening({
        pathname: '/projects',
        prefersReducedMotion: false,
        scrollPosition: 0,
      }),
      false,
    )
    assert.equal(
      shouldStartInitialHomeOpening({
        pathname: '/',
        prefersReducedMotion: false,
        scrollPosition: 240,
      }),
      false,
    )
  })

  it('presents the completed state immediately for reduced motion', () => {
    assert.equal(
      shouldStartInitialHomeOpening({
        pathname: '/',
        prefersReducedMotion: true,
        scrollPosition: 0,
      }),
      false,
    )
  })
})

describe('Initial Home opening keyboard cancellation', () => {
  it('recognizes document-scrolling keys', () => {
    for (const key of [
      'ArrowDown',
      'ArrowUp',
      'End',
      'Home',
      'PageDown',
      'PageUp',
      ' ',
    ]) {
      assert.equal(shouldCancelInitialHomeOpeningFromKey(key), true)
    }
  })

  it('ignores unrelated keyboard input', () => {
    assert.equal(shouldCancelInitialHomeOpeningFromKey('Tab'), false)
    assert.equal(shouldCancelInitialHomeOpeningFromKey('Enter'), false)
  })
})

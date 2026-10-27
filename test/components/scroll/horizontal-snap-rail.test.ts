import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getHorizontalSnapKeyboardTarget } from '../../../src/components/scroll/horizontal-snap-rail.ts'

const geometry = {
  pageRatio: 0.8,
  scrollLeft: 500,
  scrollWidth: 2000,
  viewportWidth: 400,
}

describe('Horizontal snap rail keyboard targets', () => {
  it('moves by the configured share of the viewport', () => {
    assert.equal(
      getHorizontalSnapKeyboardTarget({ ...geometry, key: 'ArrowLeft' }),
      180,
    )
    assert.equal(
      getHorizontalSnapKeyboardTarget({ ...geometry, key: 'ArrowRight' }),
      820,
    )
    assert.equal(
      getHorizontalSnapKeyboardTarget({
        ...geometry,
        key: 'ArrowRight',
        pageRatio: 0.5,
      }),
      700,
    )
  })

  it('moves Home and End to the rail boundaries', () => {
    assert.equal(
      getHorizontalSnapKeyboardTarget({ ...geometry, key: 'Home' }),
      0,
    )
    assert.equal(
      getHorizontalSnapKeyboardTarget({ ...geometry, key: 'End' }),
      1600,
    )
  })

  it('clamps arrow movement to the available range', () => {
    assert.equal(
      getHorizontalSnapKeyboardTarget({
        ...geometry,
        key: 'ArrowLeft',
        scrollLeft: 100,
      }),
      0,
    )
    assert.equal(
      getHorizontalSnapKeyboardTarget({
        ...geometry,
        key: 'ArrowRight',
        scrollLeft: 1500,
      }),
      1600,
    )
  })

  it('does not handle unsupported keys or movement beyond a reached edge', () => {
    assert.equal(
      getHorizontalSnapKeyboardTarget({ ...geometry, key: 'Enter' }),
      null,
    )
    assert.equal(
      getHorizontalSnapKeyboardTarget({
        ...geometry,
        key: 'ArrowLeft',
        scrollLeft: 0,
      }),
      null,
    )
    assert.equal(
      getHorizontalSnapKeyboardTarget({
        ...geometry,
        key: 'End',
        scrollLeft: 1600,
      }),
      null,
    )
  })

  it('does not capture keys when the rail cannot scroll', () => {
    assert.equal(
      getHorizontalSnapKeyboardTarget({
        ...geometry,
        key: 'ArrowRight',
        scrollWidth: 400,
      }),
      null,
    )
  })

  it('rejects invalid geometry and ratios', () => {
    assert.equal(
      getHorizontalSnapKeyboardTarget({
        ...geometry,
        key: 'ArrowRight',
        pageRatio: 0,
      }),
      null,
    )
    assert.equal(
      getHorizontalSnapKeyboardTarget({
        ...geometry,
        key: 'ArrowRight',
        viewportWidth: Number.NaN,
      }),
      null,
    )
  })
})

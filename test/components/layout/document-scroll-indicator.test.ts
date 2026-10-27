import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  getDocumentScrollGeometry,
  getScrollTopFromThumbPosition,
} from '../../../src/components/layout/document-scroll-indicator.ts'

describe('Document scroll indicator geometry', () => {
  it('maps viewport coverage and document progress into the overlay track', () => {
    const geometry = getDocumentScrollGeometry({
      minimumThumbHeight: 48,
      scrollHeight: 4000,
      scrollTop: 1500,
      trackHeight: 600,
      viewportHeight: 1000,
    })

    assert.deepEqual(geometry, {
      maximumScroll: 3000,
      maximumThumbOffset: 450,
      progress: 0.5,
      thumbHeight: 150,
      thumbOffset: 225,
    })
  })

  it('enforces the minimum thumb size and clamps overscroll', () => {
    const geometry = getDocumentScrollGeometry({
      minimumThumbHeight: 48,
      scrollHeight: 20_000,
      scrollTop: 30_000,
      trackHeight: 500,
      viewportHeight: 1000,
    })

    assert.equal(geometry?.thumbHeight, 48)
    assert.equal(geometry?.progress, 1)
    assert.equal(geometry?.thumbOffset, 452)
  })

  it('returns no indicator when the document does not overflow', () => {
    assert.equal(
      getDocumentScrollGeometry({
        minimumThumbHeight: 48,
        scrollHeight: 900,
        scrollTop: 0,
        trackHeight: 600,
        viewportHeight: 1000,
      }),
      null,
    )
  })

  it('maps track dragging back to document scroll position', () => {
    const geometry = getDocumentScrollGeometry({
      minimumThumbHeight: 48,
      scrollHeight: 4000,
      scrollTop: 0,
      trackHeight: 600,
      viewportHeight: 1000,
    })

    assert.ok(geometry)
    assert.equal(getScrollTopFromThumbPosition(300, 75, geometry), 1500)
    assert.equal(getScrollTopFromThumbPosition(-100, 75, geometry), 0)
    assert.equal(getScrollTopFromThumbPosition(1000, 75, geometry), 3000)
  })
})

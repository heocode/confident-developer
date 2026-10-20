import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { calculateProjectGalleryLayout } from '../../../src/features/projects/presentation/project-gallery-layout.ts'

function assertApproximatelyEqual(actual: number, expected: number) {
  assert.ok(Math.abs(actual - expected) < 0.000001, `${actual} is not approximately ${expected}`)
}

describe('Project gallery layout', () => {
  it('adds spare gallery width equally to panels while keeping metadata near its preferred width', () => {
    const layout = calculateProjectGalleryLayout({
      containerHeight: 500,
      containerWidth: 1200,
      screenshots: [
        { aspectRatio: 0.5, layoutWeight: 0.5 },
        { aspectRatio: 1, layoutWeight: 1 },
      ],
    })

    assert.ok(layout)
    assertApproximatelyEqual(layout.galleryWidth, 814.4)
    assertApproximatelyEqual(layout.screenshotWidths[0], 284.7)
    assertApproximatelyEqual(layout.screenshotWidths[1], 519.7)
    assertApproximatelyEqual(layout.screenshotWidths[0] - 267, layout.screenshotWidths[1] - 502)
    assertApproximatelyEqual(1200 - 10 - layout.galleryWidth, 375.6)
  })

  it('lets metadata contract toward its minimum before compressing natural screenshot widths', () => {
    const layout = calculateProjectGalleryLayout({
      containerHeight: 530,
      containerWidth: 1200,
      screenshots: [
        { aspectRatio: 0.5, layoutWeight: 0.5 },
        { aspectRatio: 1, layoutWeight: 1 },
      ],
    })

    assert.deepEqual(layout, {
      galleryWidth: 824,
      screenshotWidths: [282, 532],
    })
    assert.equal(1200 - 10 - layout.galleryWidth, 366)
  })

  it('protects the minimum metadata width by proportionally compressing the gallery', () => {
    const layout = calculateProjectGalleryLayout({
      containerHeight: 600,
      containerWidth: 900,
      screenshots: [
        { aspectRatio: 1, layoutWeight: 1 },
        { aspectRatio: 2, layoutWeight: 2 },
      ],
    })

    assert.ok(layout)
    assert.equal(layout.galleryWidth, 570)
    assert.equal(900 - 10 - layout.galleryWidth, 320)
    assert.equal(layout.screenshotWidths[0], 197.33333333333331)
    assert.equal(layout.screenshotWidths[1], 362.66666666666663)
  })

  it('returns no layout for unavailable container geometry', () => {
    assert.equal(
      calculateProjectGalleryLayout({
        containerHeight: 0,
        containerWidth: 1200,
        screenshots: [{ aspectRatio: 1, layoutWeight: 1 }],
      }),
      null,
    )
  })
})

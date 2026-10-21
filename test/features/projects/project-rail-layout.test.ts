import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculateExpandedProjectPanelWidth,
  calculateProjectRailLayout,
  PROJECT_RAIL_LAYOUT_TOKENS,
} from '../../../src/features/projects/presentation/project-rail-layout.ts'

test('keeps the established mobile maximum scale when the rail has enough room', () => {
  const layout = calculateProjectRailLayout({
    containerHeight: 700,
    containerWidth: 430,
  })

  assert.ok(layout)
  assert.equal(layout.scale, PROJECT_RAIL_LAYOUT_TOKENS.mobileMaxScale)
  assert.equal(
    layout.height,
    PROJECT_RAIL_LAYOUT_TOKENS.baseHeight * PROJECT_RAIL_LAYOUT_TOKENS.mobileMaxScale,
  )
})

test('scales the complete panel uniformly on a narrow rail', () => {
  const layout = calculateProjectRailLayout({
    containerHeight: 700,
    containerWidth: 320,
  })
  const expectedWidth = 320 * PROJECT_RAIL_LAYOUT_TOKENS.horizontalTrackShare

  assert.ok(layout)
  assert.equal(layout.scale, expectedWidth / PROJECT_RAIL_LAYOUT_TOKENS.baseWidth)
  assert.equal(layout.width, expectedWidth)
  assert.equal(layout.height, PROJECT_RAIL_LAYOUT_TOKENS.baseHeight * layout.scale)
})

test('uses height as the limiting dimension on a short desktop rail', () => {
  const layout = calculateProjectRailLayout({
    containerHeight: 600,
    containerWidth: 1024,
  })

  assert.ok(layout)
  assert.equal(layout.scale, 600 / PROJECT_RAIL_LAYOUT_TOKENS.baseHeight)
  assert.equal(layout.height, 600)
})

test('allows larger stable panels as desktop width becomes available', () => {
  const layout = calculateProjectRailLayout({
    containerHeight: 900,
    containerWidth: 1440,
  })

  assert.ok(layout)
  assert.equal(layout.scale, PROJECT_RAIL_LAYOUT_TOKENS.desktopMaxScale)
})

test('keeps panel scaling continuous across the responsive boundary', () => {
  const beforeBoundary = calculateProjectRailLayout({
    containerHeight: 800,
    containerWidth: 768,
  })
  const afterBoundary = calculateProjectRailLayout({
    containerHeight: 800,
    containerWidth: 769,
  })

  assert.ok(beforeBoundary)
  assert.ok(afterBoundary)
  assert.ok(afterBoundary.scale >= beforeBoundary.scale)
  assert.ok(afterBoundary.scale - beforeBoundary.scale < 0.001)
})

test('rejects invalid rail geometry', () => {
  assert.equal(calculateProjectRailLayout({ containerHeight: 0, containerWidth: 393 }), null)
  assert.equal(
    calculateProjectRailLayout({ containerHeight: 600, containerWidth: Number.NaN }),
    null,
  )
})

test('expands landscape panels by API ratio and caps extreme widths', () => {
  const portraitWidth = calculateExpandedProjectPanelWidth(0.45)
  const landscapeWidth = calculateExpandedProjectPanelWidth(1.8)
  const extremeWidth = calculateExpandedProjectPanelWidth(20)

  assert.equal(portraitWidth, PROJECT_RAIL_LAYOUT_TOKENS.baseWidth)
  assert.ok(landscapeWidth > PROJECT_RAIL_LAYOUT_TOKENS.baseWidth)
  assert.equal(extremeWidth, PROJECT_RAIL_LAYOUT_TOKENS.maxExpandedWidth)
})

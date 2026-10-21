import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculateExpandedProjectPanelWidth,
  calculateProjectMobilePanelLayout,
  PROJECT_MOBILE_PANEL_TOKENS,
} from '../../../src/features/projects/presentation/project-mobile-panel-layout.ts'

test('grows the stable mobile panel as one unit when the browser has enough room', () => {
  const layout = calculateProjectMobilePanelLayout({
    containerHeight: 700,
    containerWidth: 430,
  })

  assert.equal(layout.scale, PROJECT_MOBILE_PANEL_TOKENS.maxScale)
  assert.equal(
    layout.height,
    PROJECT_MOBILE_PANEL_TOKENS.baseHeight * PROJECT_MOBILE_PANEL_TOKENS.maxScale,
  )
  assert.equal(
    layout.width,
    PROJECT_MOBILE_PANEL_TOKENS.baseWidth * PROJECT_MOBILE_PANEL_TOKENS.maxScale,
  )
})

test('scales the complete mobile panel uniformly on a narrow browser', () => {
  const layout = calculateProjectMobilePanelLayout({
    containerHeight: 700,
    containerWidth: 320,
  })

  const expectedWidth = 320 * PROJECT_MOBILE_PANEL_TOKENS.horizontalTrackShare

  assert.equal(layout.scale, expectedWidth / PROJECT_MOBILE_PANEL_TOKENS.baseWidth)
  assert.equal(layout.width, expectedWidth)
  assert.equal(
    layout.height,
    PROJECT_MOBILE_PANEL_TOKENS.baseHeight * layout.scale,
  )
})

test('uses height as the limiting dimension on a short browser', () => {
  const layout = calculateProjectMobilePanelLayout({
    containerHeight: 400,
    containerWidth: 430,
  })

  assert.equal(layout.scale, 400 / PROJECT_MOBILE_PANEL_TOKENS.baseHeight)
  assert.ok(Math.abs(layout.height - 400) < Number.EPSILON * 400)
})

test('expands landscape panels from screenshot ratio while preserving panel padding', () => {
  const portraitWidth = calculateExpandedProjectPanelWidth(0.45)
  const landscapeWidth = calculateExpandedProjectPanelWidth(1.8)

  assert.equal(portraitWidth, PROJECT_MOBILE_PANEL_TOKENS.baseWidth)
  assert.ok(landscapeWidth > PROJECT_MOBILE_PANEL_TOKENS.baseWidth)
})

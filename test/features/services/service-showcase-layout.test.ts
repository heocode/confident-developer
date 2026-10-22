import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculateServiceShowcaseLayout,
  calculateServiceShowcasePanelWidth,
  groupServiceShowcaseAssets,
  SERVICE_SHOWCASE_LAYOUT_TOKENS,
} from '../../../src/features/services/presentation/service-showcase-layout.ts'

const productAssets = [
  { id: 'video', kind: 'video' as const },
  { id: 'image', kind: 'image' as const },
  { id: 'animation-one', kind: 'animation' as const },
  { id: 'animation-two', kind: 'animation' as const },
  { id: 'animation-three', kind: 'animation' as const },
]

test('groups consecutive animations into compact columns without changing API order', () => {
  const groups = groupServiceShowcaseAssets(productAssets)

  assert.deepEqual(
    groups.map((group) => ({
      assetIds: group.assets.map(({ id }) => id),
      kind: group.kind,
    })),
    [
      { assetIds: ['video'], kind: 'full' },
      { assetIds: ['image'], kind: 'full' },
      {
        assetIds: ['animation-one', 'animation-two', 'animation-three'],
        kind: 'compact',
      },
    ],
  )
})

test('starts another compact column when more than three animations are published', () => {
  const groups = groupServiceShowcaseAssets([
    ...productAssets,
    { id: 'animation-four', kind: 'animation' as const },
  ])

  assert.deepEqual(groups.map((group) => group.assets.length), [1, 1, 3, 1])
})

test('matches the Figma product showcase geometry at the reference height', () => {
  const groups = groupServiceShowcaseAssets(productAssets)
  const layout = calculateServiceShowcaseLayout({
    containerHeight: 560,
    containerWidth: 1320,
    groupAspectRatios: [0.5, 0.5, 1],
    groups,
  })

  assert.ok(layout)
  assert.equal(layout.height, 560)
  assert.equal(layout.compactPanelSize, 180)
  assert.deepEqual(layout.groupWidths, [290, 290, 180])
  assert.equal(layout.informationPanelWidth, 530)
})

test('gives the information panel unused rail width after shorter showcases', () => {
  const groups = groupServiceShowcaseAssets(productAssets.slice(0, 2))
  const layout = calculateServiceShowcaseLayout({
    containerHeight: 560,
    containerWidth: 1320,
    groupAspectRatios: [0.5, 0.5],
    groups,
  })

  assert.ok(layout)
  assert.deepEqual(layout.groupWidths, [290, 290])
  assert.equal(layout.informationPanelWidth, 720)
})

test('keeps three animations in one block and fits their tiles to constrained height', () => {
  const groups = groupServiceShowcaseAssets(productAssets)
  const layout = calculateServiceShowcaseLayout({
    containerHeight: 400,
    containerWidth: 600,
    groupAspectRatios: [0.5, 0.5, 1],
    groups,
  })

  assert.ok(layout)
  assert.equal(layout.height, 400)
  assert.equal(layout.compactPanelSize, (400 - 20) / 3)
  assert.deepEqual(groups.map((group) => group.assets.length), [1, 1, 3])
  assert.equal(layout.groupWidths[2], layout.compactPanelSize)
})

test('does not shrink the base media width when only height is constrained', () => {
  assert.equal(calculateServiceShowcasePanelWidth(0.5, 560), 290)
  assert.equal(calculateServiceShowcasePanelWidth(0.5, 320), 290)
})

test('caps wide showcase panels without changing portrait minimums', () => {
  assert.equal(
    calculateServiceShowcasePanelWidth(0.25),
    SERVICE_SHOWCASE_LAYOUT_TOKENS.basePanelWidth,
  )
  assert.equal(
    calculateServiceShowcasePanelWidth(20),
    SERVICE_SHOWCASE_LAYOUT_TOKENS.maxPanelWidth,
  )
})

test('rejects invalid showcase geometry', () => {
  const groups = groupServiceShowcaseAssets(productAssets.slice(0, 1))

  assert.equal(
    calculateServiceShowcaseLayout({
      containerHeight: 560,
      containerWidth: 600,
      groupAspectRatios: [],
      groups: [],
    }),
    null,
  )
  assert.equal(
    calculateServiceShowcaseLayout({
      containerHeight: 560,
      containerWidth: 600,
      groupAspectRatios: [0],
      groups,
    }),
    null,
  )
  assert.equal(
    calculateServiceShowcaseLayout({
      containerHeight: 0,
      containerWidth: 600,
      groupAspectRatios: [1],
      groups,
    }),
    null,
  )
})

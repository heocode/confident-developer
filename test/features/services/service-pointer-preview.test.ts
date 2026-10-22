import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  getServiceKeyboardPreviewWidth,
  getServicePointerPreviewWidth,
} from '../../../src/features/services/hooks/service-pointer-preview.ts'

describe('Service pointer preview geometry', () => {
  it('reserves enough surface space to keep the action inside', () => {
    assert.equal(
      getServicePointerPreviewWidth({
        actionInset: 24,
        actionWidth: 84,
        baseWidth: 420,
        maximumWidth: 1180,
        pointerOffsetX: 300,
      }),
      528,
    )
  })

  it('follows the pointer within the available row width', () => {
    assert.equal(
      getServicePointerPreviewWidth({
        actionInset: 24,
        actionWidth: 84,
        baseWidth: 420,
        maximumWidth: 1180,
        pointerOffsetX: 760,
      }),
      826,
    )
  })

  it('stops at the future Back control position', () => {
    assert.equal(
      getServicePointerPreviewWidth({
        actionInset: 24,
        actionWidth: 84,
        baseWidth: 420,
        maximumWidth: 1180,
        pointerOffsetX: 1400,
      }),
      1180,
    )
  })

  it('opens keyboard focus to a stable preview position', () => {
    assert.equal(getServiceKeyboardPreviewWidth(400, 1000, 84, 24), 820)
  })
})

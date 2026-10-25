import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  getServiceBlockEnterDelay,
  getServiceBlockExitDelay,
} from '../../../src/features/services/presentation/service-detail-motion.ts'

describe('Service detail block motion', () => {
  it('staggers early blocks and caps the delay for variable showcase sizes', () => {
    assert.equal(getServiceBlockEnterDelay(0), 20)
    assert.equal(getServiceBlockEnterDelay(3), 110)
    assert.equal(getServiceBlockEnterDelay(5), 170)
    assert.equal(getServiceBlockEnterDelay(20), 170)
  })

  it('mirrors the stagger when detail blocks leave', () => {
    assert.equal(getServiceBlockExitDelay(8, 9), 20)
    assert.equal(getServiceBlockExitDelay(5, 9), 110)
    assert.equal(getServiceBlockExitDelay(0, 9), 170)
  })
})

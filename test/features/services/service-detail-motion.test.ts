import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getServiceBlockEnterDelay } from '../../../src/features/services/presentation/service-detail-motion.ts'

describe('Service detail block motion', () => {
  it('staggers early blocks and caps the delay for variable showcase sizes', () => {
    assert.equal(getServiceBlockEnterDelay(0), 20)
    assert.equal(getServiceBlockEnterDelay(3), 110)
    assert.equal(getServiceBlockEnterDelay(5), 170)
    assert.equal(getServiceBlockEnterDelay(20), 170)
  })
})

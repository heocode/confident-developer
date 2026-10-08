import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { formatTorontoTime } from '../../../src/pages/home/utils/toronto-time.ts'

describe('Toronto time formatting', () => {
  it('formats winter dates in Eastern Standard Time', () => {
    assert.equal(formatTorontoTime(new Date('2026-01-15T18:05:00.000Z')), '13:05')
  })

  it('formats summer dates in Eastern Daylight Time', () => {
    assert.equal(formatTorontoTime(new Date('2026-07-15T18:05:00.000Z')), '14:05')
  })
})

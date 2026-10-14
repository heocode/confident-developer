import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { formatProfilePostDate } from '../../../src/features/profile/presentation/profile-formatters.ts'

describe('Profile presentation formatters', () => {
  it('formats the post date in the configured timezone', () => {
    assert.equal(
      formatProfilePostDate('2026-09-30T02:15:00.000Z', 'America/Toronto'),
      '29 Sep 2026',
    )
  })

  it('returns an empty label for an invalid API date', () => {
    assert.equal(formatProfilePostDate('not-a-date', 'America/Toronto'), '')
  })
})

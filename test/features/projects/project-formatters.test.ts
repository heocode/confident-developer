import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { formatProjectTimeline } from '../../../src/features/projects/presentation/project-formatters.ts'

describe('Project presentation formatters', () => {
  it('formats an ongoing project timeline', () => {
    assert.equal(
      formatProjectTimeline({ startDate: '2026-06-01T00:00:00.000Z', endDate: null }),
      'Jun 2026 - Ongoing',
    )
  })

  it('formats a completed project timeline without changing its ISO values', () => {
    const timeline = {
      startDate: '2026-08-01T00:00:00.000Z',
      endDate: '2026-09-30T00:00:00.000Z',
    }

    assert.equal(formatProjectTimeline(timeline), 'Aug 2026 - Sep 2026')
    assert.deepEqual(timeline, {
      startDate: '2026-08-01T00:00:00.000Z',
      endDate: '2026-09-30T00:00:00.000Z',
    })
  })
})

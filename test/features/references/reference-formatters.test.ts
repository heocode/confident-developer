import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { formatReferenceDate } from '../../../src/features/references/presentation/reference-formatters.ts'

describe('Reference presentation formatters', () => {
  it('formats the publication date for the approved design', () => {
    assert.equal(formatReferenceDate('2026-09-29T12:00:00.000Z'), '29 Sep 2026')
  })

  it('returns an empty label for an invalid API date', () => {
    assert.equal(formatReferenceDate('not-a-date'), '')
  })
})

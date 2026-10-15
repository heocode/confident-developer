import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  appendUniqueReferences,
  hasNextReferencePage,
} from '../../../src/features/references/model/reference-list-state.ts'
import type { PublicReference } from '../../../src/features/references/model/reference.types.ts'

const reference: PublicReference = {
  id: 'reference-1',
  name: 'James Smith',
  company: 'SuperSauced',
  position: 'Founder',
  testimonial: 'Vadim turns ideas into reliable products.',
  ratings: { overall: 5, technical: 5, communication: 5 },
  publishedAt: '2026-10-14T12:00:00.000Z',
}

describe('Reference list state', () => {
  it('appends new pages in backend order without duplicate IDs', () => {
    const existing = [reference, { ...reference, id: 'reference-2', name: 'Second' }]
    const incoming = [
      { ...reference, id: 'reference-2', name: 'Duplicate' },
      { ...reference, id: 'reference-3', name: 'Third' },
      { ...reference, id: 'reference-3', name: 'Repeated third' },
      { ...reference, id: 'reference-4', name: 'Fourth' },
    ]

    const result = appendUniqueReferences(existing, incoming)

    assert.deepEqual(result.map(({ id }) => id), [
      'reference-1',
      'reference-2',
      'reference-3',
      'reference-4',
    ])
    assert.equal(result[1]?.name, 'Second')
    assert.equal(result[2]?.name, 'Third')
  })

  it('detects whether another backend page is available', () => {
    assert.equal(
      hasNextReferencePage({ page: 1, limit: 10, totalItems: 20, totalPages: 2 }),
      true,
    )
    assert.equal(
      hasNextReferencePage({ page: 2, limit: 10, totalItems: 20, totalPages: 2 }),
      false,
    )
    assert.equal(
      hasNextReferencePage({ page: 1, limit: 10, totalItems: 0, totalPages: 0 }),
      false,
    )
  })
})

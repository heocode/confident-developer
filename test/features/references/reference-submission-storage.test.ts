import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  clearReferenceSubmissionOwnership,
  readReferenceSubmissionOwnership,
  writeReferenceSubmissionOwnership,
} from '../../../src/features/references/storage/reference-submission-storage.ts'
import type { ReferenceSubmissionOwnership } from '../../../src/features/references/model/reference.types.ts'

const referenceId = '68e7c0000000000000000001'
const managementToken = 'm'.repeat(43)
const ownership: ReferenceSubmissionOwnership = { referenceId, managementToken }

class MemoryStorage {
  readonly values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

describe('Reference submission ownership storage', () => {
  it('persists and restores only the versioned ownership credential', () => {
    const storage = new MemoryStorage()

    assert.equal(writeReferenceSubmissionOwnership(ownership, storage), true)
    assert.deepEqual(readReferenceSubmissionOwnership(storage), ownership)
    assert.deepEqual(JSON.parse([...storage.values.values()][0] ?? ''), {
      version: 1,
      referenceId,
      managementToken,
    })
  })

  it('clears persisted ownership', () => {
    const storage = new MemoryStorage()
    writeReferenceSubmissionOwnership(ownership, storage)

    assert.equal(clearReferenceSubmissionOwnership(storage), true)
    assert.equal(readReferenceSubmissionOwnership(storage), null)
  })

  it('removes malformed, invalid, and unknown-version payloads', () => {
    for (const serialized of [
      '{invalid-json',
      JSON.stringify({ version: 2, referenceId, managementToken }),
      JSON.stringify({ version: 1, referenceId: 'invalid', managementToken }),
      JSON.stringify({ version: 1, referenceId, managementToken: 'invalid' }),
    ]) {
      const storage = new MemoryStorage()
      storage.setItem('confident-developer.reference-submission.v1', serialized)

      assert.equal(readReferenceSubmissionOwnership(storage), null)
      assert.equal(storage.values.size, 0)
    }
  })

  it('fails safely when browser storage is unavailable', () => {
    const unavailableStorage = {
      getItem() {
        throw new Error('Storage unavailable')
      },
      removeItem() {
        throw new Error('Storage unavailable')
      },
      setItem() {
        throw new Error('Storage unavailable')
      },
    }

    assert.equal(readReferenceSubmissionOwnership(unavailableStorage), null)
    assert.equal(writeReferenceSubmissionOwnership(ownership, unavailableStorage), false)
    assert.equal(clearReferenceSubmissionOwnership(unavailableStorage), false)
  })
})

import type { ReferenceSubmissionOwnership } from '../model/reference.types.ts'

const STORAGE_KEY = 'confident-developer.reference-submission.v1'
const STORAGE_VERSION = 1
const REFERENCE_ID_PATTERN = /^[a-f\d]{24}$/i
const MANAGEMENT_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/

type ReferenceOwnershipStorage = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>

interface StoredReferenceSubmissionOwnership extends ReferenceSubmissionOwnership {
  version: typeof STORAGE_VERSION
}

function getBrowserStorage(): ReferenceOwnershipStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

function isStoredOwnership(value: unknown): value is StoredReferenceSubmissionOwnership {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false

  const candidate = value as Record<string, unknown>
  return (
    candidate.version === STORAGE_VERSION &&
    typeof candidate.referenceId === 'string' &&
    REFERENCE_ID_PATTERN.test(candidate.referenceId) &&
    typeof candidate.managementToken === 'string' &&
    MANAGEMENT_TOKEN_PATTERN.test(candidate.managementToken)
  )
}

export function readReferenceSubmissionOwnership(
  storage: ReferenceOwnershipStorage | null = getBrowserStorage(),
): ReferenceSubmissionOwnership | null {
  if (!storage) return null

  let serialized: string | null
  try {
    serialized = storage.getItem(STORAGE_KEY)
  } catch {
    return null
  }

  if (!serialized) return null

  try {
    const stored = JSON.parse(serialized) as unknown
    if (!isStoredOwnership(stored)) throw new TypeError('Invalid reference ownership data.')

    return {
      referenceId: stored.referenceId,
      managementToken: stored.managementToken,
    }
  } catch {
    try {
      storage.removeItem(STORAGE_KEY)
    } catch {
      // Storage cleanup is best-effort when browser persistence is unavailable.
    }
    return null
  }
}

export function writeReferenceSubmissionOwnership(
  ownership: ReferenceSubmissionOwnership,
  storage: ReferenceOwnershipStorage | null = getBrowserStorage(),
) {
  if (!storage || !isStoredOwnership({ version: STORAGE_VERSION, ...ownership })) return false

  try {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, ...ownership }),
    )
    return true
  } catch {
    return false
  }
}

export function clearReferenceSubmissionOwnership(
  storage: ReferenceOwnershipStorage | null = getBrowserStorage(),
) {
  if (!storage) return false

  try {
    storage.removeItem(STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

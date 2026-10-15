import {
  getApiData,
  sendApiCommand,
  sendApiData,
} from '../../../api/http-client.ts'
import type { ApiRequestOptions } from '../../../api/http-client.ts'
import type {
  OwnedReference,
  PublicReferencePage,
  ReferenceSubmissionOwnership,
  SubmitReferenceInput,
  SubmitReferenceResult,
} from '../model/reference.types.ts'

const REFERENCES_PATH = '/api/v1/references'
const REFERENCE_ID_PATTERN = /^[a-f\d]{24}$/i
const MANAGEMENT_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/

export interface ReferencePageInput {
  page: number
  limit: number
}

function createPaginationQuery({ page, limit }: ReferencePageInput) {
  if (!Number.isSafeInteger(page) || page < 1) {
    throw new TypeError('Reference page must be a positive integer.')
  }

  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 50) {
    throw new TypeError('Reference page limit must be an integer between 1 and 50.')
  }

  return new URLSearchParams({ page: String(page), limit: String(limit) })
}

function getOwnershipHeaders({ referenceId, managementToken }: ReferenceSubmissionOwnership) {
  if (!REFERENCE_ID_PATTERN.test(referenceId)) {
    throw new TypeError('Reference submission ID is invalid.')
  }

  if (!MANAGEMENT_TOKEN_PATTERN.test(managementToken)) {
    throw new TypeError('Reference management token is invalid.')
  }

  return { 'X-Reference-Management-Token': managementToken }
}

export function getReferencesPage(input: ReferencePageInput, options?: ApiRequestOptions) {
  const query = createPaginationQuery(input)
  return getApiData<PublicReferencePage>(`${REFERENCES_PATH}?${query}`, options)
}

export function submitReference(input: SubmitReferenceInput, options?: ApiRequestOptions) {
  return sendApiData<SubmitReferenceResult, SubmitReferenceInput>(REFERENCES_PATH, {
    method: 'POST',
    body: input,
    signal: options?.signal,
  })
}

export function getOwnedReference(
  ownership: ReferenceSubmissionOwnership,
  options?: ApiRequestOptions,
) {
  const headers = getOwnershipHeaders(ownership)
  return getApiData<OwnedReference>(
    `${REFERENCES_PATH}/submissions/${ownership.referenceId}`,
    { headers, signal: options?.signal },
  )
}

export function deleteOwnedReference(
  ownership: ReferenceSubmissionOwnership,
  options?: ApiRequestOptions,
) {
  const headers = getOwnershipHeaders(ownership)
  return sendApiCommand(`${REFERENCES_PATH}/${ownership.referenceId}/submission`, {
    method: 'DELETE',
    headers,
    signal: options?.signal,
  })
}

import { ApiError } from './api-error.ts'
import type { ApiEnvelope } from './api.types.ts'

export interface ApiRequestOptions {
  signal?: AbortSignal
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasMessage(value: unknown): value is { message: string } {
  return isRecord(value) && typeof value.message === 'string'
}

function isSuccessfulEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return (
    isRecord(value) &&
    value.success === true &&
    typeof value.message === 'string' &&
    Object.hasOwn(value, 'data')
  )
}

function assertRelativeApiPath(path: string) {
  if (!path.startsWith('/api/')) {
    throw new TypeError('API requests must use a relative /api/... path.')
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return undefined
  }
}

export async function getApiData<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  assertRelativeApiPath(path)

  let response: Response

  try {
    response = await fetch(path, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
      signal: options.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error

    throw new ApiError('Unable to reach the API.', {
      cause: error,
      kind: 'network',
    })
  }

  const payload = await readJson(response)

  if (!response.ok) {
    throw new ApiError(
      hasMessage(payload) && payload.message.trim()
        ? payload.message
        : `API request failed with status ${response.status}.`,
      { kind: 'http', status: response.status },
    )
  }

  if (!isSuccessfulEnvelope<T>(payload)) {
    const message = hasMessage(payload) && payload.message.trim() ? payload.message : 'The API returned an invalid response.'

    throw new ApiError(message, {
      kind: 'invalid-response',
      status: response.status,
    })
  }

  return payload.data
}

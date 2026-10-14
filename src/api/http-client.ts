import { ApiError } from './api-error.ts'
import type { ApiEnvelope } from './api.types.ts'

export interface ApiRequestOptions {
  signal?: AbortSignal
}

export interface ApiMutationOptions<TBody> extends ApiRequestOptions {
  body: TBody
  method: 'DELETE' | 'POST' | 'PUT'
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

async function requestApiData<T>(path: string, init: RequestInit): Promise<T> {
  assertRelativeApiPath(path)

  let response: Response

  try {
    response = await fetch(path, {
      ...init,
      credentials: 'same-origin',
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

export function getApiData<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  return requestApiData<T>(path, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal: options.signal,
  })
}

export function sendApiData<TResponse, TBody>(
  path: string,
  options: ApiMutationOptions<TBody>,
): Promise<TResponse> {
  return requestApiData<TResponse>(path, {
    method: options.method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options.body),
    signal: options.signal,
  })
}

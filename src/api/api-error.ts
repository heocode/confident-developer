export type ApiErrorKind = 'http' | 'invalid-response' | 'network'

interface ApiErrorOptions {
  cause?: unknown
  kind: ApiErrorKind
  status?: number
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number

  constructor(message: string, options: ApiErrorOptions) {
    super(message, { cause: options.cause })
    this.name = 'ApiError'
    this.kind = options.kind
    this.status = options.status
  }
}

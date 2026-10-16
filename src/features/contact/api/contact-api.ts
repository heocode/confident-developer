import { sendApiCommand } from '../../../api/http-client.ts'
import type { ApiRequestOptions } from '../../../api/http-client.ts'
import type { SubmitContactInput } from '../model/contact.types.ts'

const CONTACT_PATH = '/api/v1/contact'

export function submitContact(
  input: SubmitContactInput,
  options?: ApiRequestOptions,
) {
  return sendApiCommand(CONTACT_PATH, {
    method: 'POST',
    body: input,
    signal: options?.signal,
  })
}

import {
  CONTACT_BUDGET_KEYS,
  CONTACT_SCOPE_KEYS,
} from './contact.types.ts'
import type {
  ContactBudget,
  ContactScope,
  SubmitContactInput,
} from './contact.types.ts'

export interface ContactFormValues {
  name: string
  email: string
  message: string
  scopes: ContactScope[]
  budget: ContactBudget | null
}

export type ContactFormField = 'name' | 'email' | 'message' | 'scopes' | 'budget'

export type ContactFormErrors = Partial<Record<ContactFormField, string>>

export const EMPTY_CONTACT_FORM: ContactFormValues = {
  name: '',
  email: '',
  message: '',
  scopes: [],
  budget: null,
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u
const UNSAFE_CHARACTER_RANGES = [
  [0x0000, 0x0009],
  [0x000b, 0x001f],
  [0x007f, 0x009f],
  [0x200b, 0x200f],
  [0x202a, 0x202e],
  [0x2060, 0x206f],
  [0xfeff, 0xfeff],
] as const
const CONTACT_SCOPE_SET = new Set<string>(CONTACT_SCOPE_KEYS)
const CONTACT_BUDGET_SET = new Set<string>(CONTACT_BUDGET_KEYS)

export function normalizeContactName(value: string) {
  return value.normalize('NFC').trim().replace(/\s+/gu, ' ')
}

export function normalizeContactEmail(value: string) {
  return value.normalize('NFC').trim().toLowerCase()
}

export function normalizeContactMessage(value: string) {
  return value.normalize('NFC').replace(/\r\n?/gu, '\n').trim()
}

function isContactScope(value: unknown): value is ContactScope {
  return typeof value === 'string' && CONTACT_SCOPE_SET.has(value)
}

function isContactBudget(value: unknown): value is ContactBudget {
  return typeof value === 'string' && CONTACT_BUDGET_SET.has(value)
}

function containsUnsupportedCharacters(value: string) {
  return Array.from(value).some((character) => {
    const codePoint = character.codePointAt(0)
    return UNSAFE_CHARACTER_RANGES.some(
      ([start, end]) => codePoint !== undefined && codePoint >= start && codePoint <= end,
    )
  })
}

export function validateContactForm(values: ContactFormValues) {
  const errors: ContactFormErrors = {}
  const name = normalizeContactName(values.name)
  const email = normalizeContactEmail(values.email)
  const message = normalizeContactMessage(values.message)

  if (!name) errors.name = 'Name is required.'
  else if (name.length < 2) errors.name = 'Name must contain at least 2 characters.'
  else if (name.length > 80) errors.name = 'Name must contain no more than 80 characters.'
  else if (containsUnsupportedCharacters(name)) errors.name = 'Name contains unsupported characters.'

  if (!email) errors.email = 'Email is required.'
  else if (!EMAIL_PATTERN.test(email) || email.length > 254) errors.email = 'Enter a valid email address.'

  if (!message) errors.message = 'Message is required.'
  else if (message.length < 20) errors.message = 'Message must contain at least 20 characters.'
  else if (message.length > 5_000) errors.message = 'Message must contain no more than 5000 characters.'
  else if (containsUnsupportedCharacters(message)) errors.message = 'Message contains unsupported characters.'

  if (values.scopes.length === 0) {
    errors.scopes = 'Choose at least one scope of work.'
  } else if (!values.scopes.every(isContactScope)) {
    errors.scopes = 'Choose a valid scope of work.'
  } else if (new Set(values.scopes).size !== values.scopes.length) {
    errors.scopes = 'Scope of work must not contain duplicates.'
  }

  if (!isContactBudget(values.budget)) errors.budget = 'Choose a budget.'

  return errors
}

export function hasContactFormErrors(errors: ContactFormErrors) {
  return Object.keys(errors).length > 0
}

export function createContactSubmissionInput(
  values: ContactFormValues,
  turnstileToken: string,
): SubmitContactInput {
  if (hasContactFormErrors(validateContactForm(values)) || !isContactBudget(values.budget)) {
    throw new TypeError('Contact form is invalid.')
  }

  const normalizedTurnstileToken = turnstileToken.trim()
  if (!normalizedTurnstileToken || normalizedTurnstileToken.length > 2_048) {
    throw new TypeError('Turnstile token is invalid.')
  }

  return {
    name: normalizeContactName(values.name),
    email: normalizeContactEmail(values.email),
    message: normalizeContactMessage(values.message),
    scopes: [...values.scopes],
    budget: values.budget,
    turnstileToken: normalizedTurnstileToken,
    website: '',
  }
}

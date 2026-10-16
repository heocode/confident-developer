export const CONTACT_SCOPE_KEYS = [
  'product-design',
  'mobile-app',
  'website-web-app',
  'backend-api',
  'full-product',
  'other',
] as const

export type ContactScope = (typeof CONTACT_SCOPE_KEYS)[number]

export const CONTACT_BUDGET_KEYS = [
  'under-500',
  '500-1000',
  '1000-2500',
  '2500-5000',
  'over-5000',
  'not-sure',
] as const

export type ContactBudget = (typeof CONTACT_BUDGET_KEYS)[number]

export interface SubmitContactInput {
  name: string
  email: string
  message: string
  scopes: ContactScope[]
  budget: ContactBudget
  turnstileToken: string
  website: ''
}

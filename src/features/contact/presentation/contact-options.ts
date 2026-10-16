import {
  CONTACT_BUDGET_KEYS,
  CONTACT_SCOPE_KEYS,
} from '../model/contact.types.ts'
import type { ContactBudget, ContactScope } from '../model/contact.types.ts'

export interface ContactOption<TValue extends string> {
  label: string
  value: TValue
}

const CONTACT_SCOPE_LABELS: Record<ContactScope, string> = {
  'product-design': 'Product Design',
  'mobile-app': 'Mobile App',
  'website-web-app': 'Website / Web App',
  'backend-api': 'Backend / API',
  'full-product': 'Full Product',
  other: 'Other',
}

const CONTACT_BUDGET_LABELS: Record<ContactBudget, string> = {
  'under-500': 'Under $500',
  '500-1000': '$500-$1000',
  '1000-2500': '$1000-$2500',
  '2500-5000': '$2500-$5000',
  'over-5000': 'More than $5000',
  'not-sure': 'Not sure yet',
}

export const CONTACT_SCOPE_OPTIONS: readonly ContactOption<ContactScope>[] =
  CONTACT_SCOPE_KEYS.map((value) => ({ value, label: CONTACT_SCOPE_LABELS[value] }))

export const CONTACT_BUDGET_OPTIONS: readonly ContactOption<ContactBudget>[] =
  CONTACT_BUDGET_KEYS.map((value) => ({ value, label: CONTACT_BUDGET_LABELS[value] }))

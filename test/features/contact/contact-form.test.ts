import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  createContactSubmissionInput,
  hasContactFormErrors,
  normalizeContactEmail,
  normalizeContactMessage,
  normalizeContactName,
  validateContactForm,
} from '../../../src/features/contact/model/contact-form.ts'
import type { ContactFormValues } from '../../../src/features/contact/model/contact-form.ts'
import type {
  ContactBudget,
  ContactScope,
} from '../../../src/features/contact/model/contact.types.ts'
import {
  CONTACT_BUDGET_OPTIONS,
  CONTACT_SCOPE_OPTIONS,
} from '../../../src/features/contact/presentation/contact-options.ts'

const validForm: ContactFormValues = {
  name: 'Jordan Smith',
  email: 'jordan@example.com',
  message: 'I would like to discuss a portfolio application.',
  scopes: ['website-web-app', 'backend-api'],
  budget: '2500-5000',
}

describe('Contact form model', () => {
  it('normalizes values using the backend Contact rules', () => {
    assert.equal(normalizeContactName('  Jorda\u0301n   Smith\n'), 'Jordán Smith')
    assert.equal(normalizeContactEmail(' JORDAN@Example.COM '), 'jordan@example.com')
    assert.equal(
      normalizeContactMessage(' First line.\r\nSecond line.\rThird line. '),
      'First line.\nSecond line.\nThird line.',
    )
  })

  it('accepts boundary-length content and every allowlisted option', () => {
    assert.deepEqual(validateContactForm({ ...validForm, name: 'Jo', message: 'm'.repeat(20) }), {})
    assert.deepEqual(
      validateContactForm({ ...validForm, name: 'n'.repeat(80), message: 'm'.repeat(5_000) }),
      {},
    )

    for (const { value: budget } of CONTACT_BUDGET_OPTIONS) {
      assert.equal(validateContactForm({ ...validForm, budget }).budget, undefined)
    }

    assert.deepEqual(
      validateContactForm({
        ...validForm,
        scopes: CONTACT_SCOPE_OPTIONS.map(({ value }) => value),
      }),
      {},
    )
  })

  it('requires every visible field and enforces backend length limits', () => {
    const emptyErrors = validateContactForm({
      name: '',
      email: '',
      message: '',
      scopes: [],
      budget: null,
    })

    assert.equal(hasContactFormErrors(emptyErrors), true)
    assert.deepEqual(Object.keys(emptyErrors).sort(), [
      'budget',
      'email',
      'message',
      'name',
      'scopes',
    ])
    assert.ok(validateContactForm({ ...validForm, name: 'x' }).name)
    assert.ok(validateContactForm({ ...validForm, name: 'x'.repeat(81) }).name)
    assert.ok(validateContactForm({ ...validForm, message: 'm'.repeat(19) }).message)
    assert.ok(validateContactForm({ ...validForm, message: 'm'.repeat(5_001) }).message)
    assert.ok(validateContactForm({ ...validForm, email: 'not-an-email' }).email)
    assert.ok(validateContactForm({ ...validForm, email: `${'a'.repeat(244)}@example.com` }).email)
  })

  it('rejects unsupported characters, unknown options, and duplicate scopes', () => {
    assert.ok(validateContactForm({ ...validForm, name: 'Jordan\u200BSmith' }).name)
    assert.ok(
      validateContactForm({
        ...validForm,
        message: 'This message includes a forbidden\u202E character.',
      }).message,
    )
    assert.ok(
      validateContactForm({
        ...validForm,
        scopes: ['unknown-scope'] as unknown as ContactScope[],
      }).scopes,
    )
    assert.ok(
      validateContactForm({
        ...validForm,
        scopes: ['backend-api', 'backend-api'],
      }).scopes,
    )
    assert.ok(
      validateContactForm({
        ...validForm,
        budget: 'unlimited' as ContactBudget,
      }).budget,
    )
  })

  it('creates the exact normalized API input without mutating form state', () => {
    const scopes: ContactScope[] = ['website-web-app', 'backend-api']
    const values: ContactFormValues = {
      ...validForm,
      name: '  Jordan   Smith ',
      email: ' JORDAN@Example.COM ',
      message: ' First line contains enough detail.\r\nSecond line. ',
      scopes,
    }

    const result = createContactSubmissionInput(values, ' verified-contact-token ')

    assert.deepEqual(result, {
      name: 'Jordan Smith',
      email: 'jordan@example.com',
      message: 'First line contains enough detail.\nSecond line.',
      scopes: ['website-web-app', 'backend-api'],
      budget: '2500-5000',
      turnstileToken: 'verified-contact-token',
      website: '',
    })
    assert.notEqual(result.scopes, scopes)
    assert.deepEqual(scopes, ['website-web-app', 'backend-api'])
  })

  it('refuses to create a payload from invalid form or verification state', () => {
    assert.throws(
      () => createContactSubmissionInput({ ...validForm, budget: null }, 'verified-token'),
      /form is invalid/i,
    )
    assert.throws(() => createContactSubmissionInput(validForm, '   '), /token is invalid/i)
    assert.throws(
      () => createContactSubmissionInput(validForm, 't'.repeat(2_049)),
      /token is invalid/i,
    )
  })

  it('keeps API keys and display labels aligned with the approved form', () => {
    assert.deepEqual(CONTACT_SCOPE_OPTIONS, [
      { value: 'product-design', label: 'Product Design' },
      { value: 'mobile-app', label: 'Mobile App' },
      { value: 'website-web-app', label: 'Website / Web App' },
      { value: 'backend-api', label: 'Backend / API' },
      { value: 'full-product', label: 'Full Product' },
      { value: 'other', label: 'Other' },
    ])
    assert.deepEqual(CONTACT_BUDGET_OPTIONS, [
      { value: 'under-500', label: 'Under $500' },
      { value: '500-1000', label: '$500-$1000' },
      { value: '1000-2500', label: '$1000-$2500' },
      { value: '2500-5000', label: '$2500-$5000' },
      { value: 'over-5000', label: 'More than $5000' },
      { value: 'not-sure', label: 'Not sure yet' },
    ])
  })
})

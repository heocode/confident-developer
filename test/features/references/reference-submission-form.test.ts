import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  createReferenceSubmissionInput,
  hasReferenceSubmissionErrors,
  validateReferenceSubmission,
  validateReferenceTestimonial,
} from '../../../src/features/references/model/reference-submission-form.ts'
import type { ReferenceSubmissionDetails } from '../../../src/features/references/model/reference-submission-form.ts'

const validDetails: ReferenceSubmissionDetails = {
  name: 'James Smith',
  email: 'james@example.com',
  company: 'SuperSauced',
  position: 'Founder',
  ratings: { overall: 5, technical: 4, communication: 5 },
}

const testimonial = 'Vadim turns ideas into reliable products.'

describe('Reference submission form', () => {
  it('accepts a complete submission and creates the exact API input', () => {
    assert.deepEqual(validateReferenceSubmission(testimonial, validDetails), {})

    assert.deepEqual(
      createReferenceSubmissionInput(
        `  ${testimonial}\r\nGreat communication.  `,
        {
          ...validDetails,
          name: '  James Smith  ',
          email: ' JAMES@EXAMPLE.COM ',
        },
        'verified-token',
      ),
      {
        name: 'James Smith',
        email: 'james@example.com',
        company: 'SuperSauced',
        position: 'Founder',
        testimonial: `${testimonial}\nGreat communication.`,
        ratings: validDetails.ratings,
        turnstileToken: 'verified-token',
        website: '',
      },
    )
  })

  it('requires every details field and all three ratings', () => {
    const errors = validateReferenceSubmission(testimonial, {
      name: '',
      email: 'invalid',
      company: '',
      position: '',
      ratings: { overall: 0, technical: 0, communication: 0 },
    })

    assert.equal(hasReferenceSubmissionErrors(errors), true)
    assert.deepEqual(Object.keys(errors).sort(), [
      'communication',
      'company',
      'email',
      'name',
      'overall',
      'position',
      'technical',
    ])
  })

  it('matches the backend testimonial length and link restrictions', () => {
    assert.match(validateReferenceTestimonial('Too short') ?? '', /at least 20/)
    assert.match(
      validateReferenceTestimonial('Read the full reference at https://example.com') ?? '',
      /cannot contain links/,
    )
    assert.equal(validateReferenceTestimonial(testimonial), null)
  })
})

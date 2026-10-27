import type { ReferenceRatings, SubmitReferenceInput } from './reference.types.ts'

export interface ReferenceSubmissionDetails {
  name: string
  email: string
  company: string
  position: string
  ratings: ReferenceRatings
}

export type ReferenceSubmissionTextField = Exclude<keyof ReferenceSubmissionDetails, 'ratings'>

export type ReferenceSubmissionField = ReferenceSubmissionTextField | keyof ReferenceRatings

export type ReferenceSubmissionErrors = Partial<
  Record<ReferenceSubmissionField | 'testimonial', string>
>

export const EMPTY_REFERENCE_SUBMISSION_DETAILS: ReferenceSubmissionDetails = {
  name: '',
  email: '',
  company: '',
  position: '',
  ratings: { overall: 0, technical: 0, communication: 0 },
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u
const URL_PATTERN = /(?:https?:\/\/|www\.|\b(?:[a-z\d-]+\.)+[a-z]{2,63}(?:\/\S*)?\b)/iu

function validateText(value: string, label: string, min: number, max: number) {
  const normalized = value.trim()
  if (!normalized) return `${label} is required.`
  if (normalized.length < min) return `${label} must contain at least ${min} characters.`
  if (normalized.length > max) return `${label} must contain no more than ${max} characters.`
  return null
}

export function validateReferenceTestimonial(testimonial: string) {
  const lengthError = validateText(testimonial, 'Your reference', 20, 1_500)
  if (lengthError) return lengthError
  if (URL_PATTERN.test(testimonial)) return 'References cannot contain links.'
  return null
}

export function validateReferenceSubmission(
  testimonial: string,
  details: ReferenceSubmissionDetails,
) {
  const errors: ReferenceSubmissionErrors = {}
  const testimonialError = validateReferenceTestimonial(testimonial)
  const nameError = validateText(details.name, 'Name', 2, 80)
  const companyError = validateText(details.company, 'Company', 2, 120)
  const positionError = validateText(details.position, 'Position', 2, 120)
  const email = details.email.trim()

  if (testimonialError) errors.testimonial = testimonialError
  if (nameError) errors.name = nameError
  if (!email) errors.email = 'Email is required.'
  else if (!EMAIL_PATTERN.test(email) || email.length > 254) errors.email = 'Enter a valid email address.'
  if (companyError) errors.company = companyError
  if (positionError) errors.position = positionError

  for (const rating of ['overall', 'technical', 'communication'] as const) {
    if (!Number.isInteger(details.ratings[rating]) || details.ratings[rating] < 1 || details.ratings[rating] > 5) {
      errors[rating] = 'Choose a rating from 1 to 5.'
    }
  }

  return errors
}

export function hasReferenceSubmissionErrors(errors: ReferenceSubmissionErrors) {
  return Object.keys(errors).length > 0
}

export function createReferenceSubmissionInput(
  testimonial: string,
  details: ReferenceSubmissionDetails,
  turnstileToken: string,
): SubmitReferenceInput {
  return {
    name: details.name.trim(),
    email: details.email.trim().toLowerCase(),
    company: details.company.trim(),
    position: details.position.trim(),
    testimonial: testimonial.replace(/\r\n?/gu, '\n').trim(),
    ratings: details.ratings,
    turnstileToken,
    website: '',
  }
}

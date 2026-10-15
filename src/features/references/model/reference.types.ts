export interface ReferenceRatings {
  overall: number
  technical: number
  communication: number
}

export interface ReferencePagination {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export interface PublicReference {
  id: string
  name: string
  company: string
  position: string
  testimonial: string
  ratings: ReferenceRatings
  publishedAt: string
}

export interface ReferenceEmptyState {
  author: {
    displayName: string
    handle: string
    avatar: {
      url: string
      alt: string
    }
  }
  message: string
  updatedAt: string
}

export interface PublicReferencePage {
  emptyState: ReferenceEmptyState | null
  items: PublicReference[]
  pagination: ReferencePagination
}

export type OwnedReferenceStatus = 'approved' | 'pending' | 'rejected'

export interface OwnedReference {
  id: string
  name: string
  company: string
  position: string
  testimonial: string
  ratings: ReferenceRatings
  status: OwnedReferenceStatus
  submittedAt: string
  approvedAt: string | null
}

export interface SubmitReferenceInput {
  name: string
  email: string
  company: string
  position: string
  testimonial: string
  ratings: ReferenceRatings
  turnstileToken: string
  website: string
}

export interface SubmitReferenceResult {
  reference: OwnedReference
  managementToken: string
}

export interface ReferenceSubmissionOwnership {
  referenceId: string
  managementToken: string
}

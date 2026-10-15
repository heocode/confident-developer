import type { PublicReference, ReferencePagination } from './reference.types.ts'

export interface ReferenceListPage {
  items: PublicReference[]
  pagination: ReferencePagination
}

export function appendUniqueReferences(
  currentItems: PublicReference[],
  incomingItems: PublicReference[],
) {
  const knownIds = new Set(currentItems.map(({ id }) => id))
  const nextItems = [...currentItems]

  for (const reference of incomingItems) {
    if (knownIds.has(reference.id)) continue
    knownIds.add(reference.id)
    nextItems.push(reference)
  }

  return nextItems
}

export function hasNextReferencePage(pagination: ReferencePagination) {
  return pagination.page < pagination.totalPages
}

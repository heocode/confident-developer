const ENTER_DELAY_MS = 30
const ENTER_DELAY_OFFSET_MS = 20
const EXIT_DELAY_MS = 20
const EXIT_DELAY_OFFSET_MS = 15
const MAX_STAGGER_INDEX = 5

export const SERVICE_DETAIL_BLOCK_EXIT_DURATION_MS = 265

export function getServiceBlockEnterDelay(index: number) {
  return ENTER_DELAY_OFFSET_MS + Math.min(index, MAX_STAGGER_INDEX) * ENTER_DELAY_MS
}

export function getServiceBlockExitDelay(index: number, blockCount: number) {
  const reverseIndex = Math.max(0, blockCount - index - 1)
  return (
    EXIT_DELAY_OFFSET_MS +
    Math.min(reverseIndex, MAX_STAGGER_INDEX) * EXIT_DELAY_MS
  )
}

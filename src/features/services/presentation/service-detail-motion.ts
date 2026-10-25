const ENTER_DELAY_MS = 30
const ENTER_DELAY_OFFSET_MS = 20
const MAX_STAGGER_INDEX = 5

export function getServiceBlockEnterDelay(index: number) {
  return ENTER_DELAY_OFFSET_MS + Math.min(index, MAX_STAGGER_INDEX) * ENTER_DELAY_MS
}

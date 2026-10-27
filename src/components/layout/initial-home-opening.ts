export const INITIAL_HOME_OPENING_DURATION_MS = 900

const SCROLL_KEYS = new Set([
  'ArrowDown',
  'ArrowUp',
  'End',
  'Home',
  'PageDown',
  'PageUp',
  ' ',
])

interface InitialHomeOpeningEnvironment {
  pathname: string
  prefersReducedMotion: boolean
  scrollPosition: number
}

export function shouldStartInitialHomeOpening({
  pathname,
  prefersReducedMotion,
  scrollPosition,
}: InitialHomeOpeningEnvironment) {
  return pathname === '/' && !prefersReducedMotion && scrollPosition <= 1
}

export function shouldCancelInitialHomeOpeningFromKey(key: string) {
  return SCROLL_KEYS.has(key)
}

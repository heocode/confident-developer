import { useSyncExternalStore } from 'react'

const shortMobileViewportQuery = '(max-width: 48rem) and (max-height: 32rem)'

function subscribe(onChange: () => void) {
  const query = window.matchMedia(shortMobileViewportQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function getSnapshot() {
  return window.matchMedia(shortMobileViewportQuery).matches
}

export function useShortMobileViewport() {
  return useSyncExternalStore(subscribe, getSnapshot)
}

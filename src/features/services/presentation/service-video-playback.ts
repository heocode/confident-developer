export type ServiceVideoPlaybackIntent = 'idle' | 'pause' | 'play'

interface ServiceVideoPlaybackConditions {
  hasActivated: boolean
  hasEnded: boolean
  hasFailed: boolean
  isDocumentVisible: boolean
  isPanelVisible: boolean
  manualPlaybackRequested: boolean
  prefersReducedMotion: boolean
}

export function getServiceVideoPlaybackIntent({
  hasActivated,
  hasEnded,
  hasFailed,
  isDocumentVisible,
  isPanelVisible,
  manualPlaybackRequested,
  prefersReducedMotion,
}: ServiceVideoPlaybackConditions): ServiceVideoPlaybackIntent {
  if (!hasActivated) return 'idle'

  if (
    hasEnded ||
    hasFailed ||
    !isDocumentVisible ||
    !isPanelVisible ||
    (prefersReducedMotion && !manualPlaybackRequested)
  ) {
    return 'pause'
  }

  return 'play'
}

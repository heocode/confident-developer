export type ServiceRivePlaybackIntent = 'pause' | 'play' | 'preview' | 'start'

interface ServiceRivePlaybackConditions {
  allAssetsSettled: boolean
  hasStarted: boolean
  isDocumentVisible: boolean
  isStackVisible: boolean
  prefersReducedMotion: boolean
}

export type ServiceRiveStateMachineSelection =
  | { machineName: string; issue: null }
  | { machineName: null; issue: 'ambiguous-state-machine' | 'missing-state-machine' }

export function selectServiceRiveStateMachine(
  stateMachineNames: readonly string[],
): ServiceRiveStateMachineSelection {
  if (stateMachineNames.length === 0) {
    return { issue: 'missing-state-machine', machineName: null }
  }

  if (stateMachineNames.length > 1) {
    return { issue: 'ambiguous-state-machine', machineName: null }
  }

  return { issue: null, machineName: stateMachineNames[0] }
}

export function getServiceRivePlaybackIntent({
  allAssetsSettled,
  hasStarted,
  isDocumentVisible,
  isStackVisible,
  prefersReducedMotion,
}: ServiceRivePlaybackConditions): ServiceRivePlaybackIntent {
  const canPlay =
    isDocumentVisible && isStackVisible && !prefersReducedMotion

  if (!hasStarted) {
    return allAssetsSettled && canPlay ? 'start' : 'preview'
  }

  return canPlay ? 'play' : 'pause'
}

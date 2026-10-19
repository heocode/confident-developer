interface TransitionPhase {
  end: number
  start: number
}

export interface ContactTransitionState {
  bottomProgress: number
  buttonProgress: number
  progress: number
  titleProgress: number
}

const TRANSITION_START_VIEWPORT_RATIO = 0.38
const TRANSITION_END_VIEWPORT_RATIO = 0.98
const CONTACT_TITLE_PHASE: TransitionPhase = { start: 0.08, end: 0.32 }
const CONTACT_BUTTON_PHASE: TransitionPhase = { start: 0.4, end: 0.64 }
const CONTACT_BOTTOM_PHASE: TransitionPhase = { start: 0.7, end: 1 }

function clampUnit(value: number) {
  return Math.min(1, Math.max(0, value))
}

function mapPhase(progress: number, phase: TransitionPhase) {
  const phaseProgress = clampUnit((progress - phase.start) / (phase.end - phase.start))
  return phaseProgress * phaseProgress * (3 - 2 * phaseProgress)
}

function createInitialState(): ContactTransitionState {
  return {
    bottomProgress: 0,
    buttonProgress: 0,
    progress: 0,
    titleProgress: 0,
  }
}

export function getContactTransitionState(
  contactSectionTop: number,
  viewportHeight: number,
): ContactTransitionState {
  if (
    !Number.isFinite(contactSectionTop) ||
    !Number.isFinite(viewportHeight) ||
    viewportHeight <= 0
  ) {
    return createInitialState()
  }

  const revealedDistance = viewportHeight - contactSectionTop
  const transitionStart = viewportHeight * TRANSITION_START_VIEWPORT_RATIO
  const transitionEnd = viewportHeight * TRANSITION_END_VIEWPORT_RATIO
  const progress = clampUnit(
    (revealedDistance - transitionStart) / (transitionEnd - transitionStart),
  )

  return {
    bottomProgress: mapPhase(progress, CONTACT_BOTTOM_PHASE),
    buttonProgress: mapPhase(progress, CONTACT_BUTTON_PHASE),
    progress,
    titleProgress: mapPhase(progress, CONTACT_TITLE_PHASE),
  }
}

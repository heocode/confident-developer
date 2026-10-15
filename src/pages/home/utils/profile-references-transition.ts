interface TransitionPhase {
  end: number
  start: number
}

export interface ProfileReferencesTransitionState {
  progress: number
  profileContentProgress: number
  referencesPanelProgress: number
  referencesTitleProgress: number
}

const TRANSITION_START_VIEWPORT_RATIO = 0.05
const TRANSITION_END_VIEWPORT_RATIO = 0.92
const PROFILE_EXIT_PHASE: TransitionPhase = { start: 0.02, end: 0.32 }
const REFERENCES_TITLE_PHASE: TransitionPhase = { start: 0.08, end: 0.32 }
const REFERENCES_PANEL_PHASE: TransitionPhase = { start: 0.56, end: 0.86 }

function clampUnit(value: number) {
  return Math.min(1, Math.max(0, value))
}

function mapPhase(progress: number, phase: TransitionPhase) {
  const phaseProgress = clampUnit((progress - phase.start) / (phase.end - phase.start))
  return phaseProgress * phaseProgress * (3 - 2 * phaseProgress)
}

function createInitialState(): ProfileReferencesTransitionState {
  return {
    progress: 0,
    profileContentProgress: 1,
    referencesPanelProgress: 0,
    referencesTitleProgress: 0,
  }
}

export function getProfileReferencesTransitionState(
  referencesSectionTop: number,
  viewportHeight: number,
): ProfileReferencesTransitionState {
  if (
    !Number.isFinite(referencesSectionTop) ||
    !Number.isFinite(viewportHeight) ||
    viewportHeight <= 0
  ) {
    return createInitialState()
  }

  const revealedDistance = viewportHeight - referencesSectionTop
  const transitionStart = viewportHeight * TRANSITION_START_VIEWPORT_RATIO
  const transitionEnd = viewportHeight * TRANSITION_END_VIEWPORT_RATIO
  const progress = clampUnit(
    (revealedDistance - transitionStart) / (transitionEnd - transitionStart),
  )

  return {
    progress,
    profileContentProgress: 1 - mapPhase(progress, PROFILE_EXIT_PHASE),
    referencesPanelProgress: mapPhase(progress, REFERENCES_PANEL_PHASE),
    referencesTitleProgress: mapPhase(progress, REFERENCES_TITLE_PHASE),
  }
}

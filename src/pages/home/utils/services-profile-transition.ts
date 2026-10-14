interface TransitionPhase {
  end: number
  start: number
}

export interface ServicesProfileTransitionState {
  progress: number
  profileCardProgress: number
  profileTitleProgress: number
  servicesContentProgress: number
}

const TRANSITION_START_VIEWPORT_RATIO = 0.05
const TRANSITION_END_VIEWPORT_RATIO = 0.92
const SERVICES_EXIT_PHASE: TransitionPhase = { start: 0.02, end: 0.32 }
const PROFILE_TITLE_PHASE: TransitionPhase = { start: 0.08, end: 0.32 }
const PROFILE_CARD_PHASE: TransitionPhase = { start: 0.56, end: 0.86 }

function clampUnit(value: number) {
  return Math.min(1, Math.max(0, value))
}

function mapPhase(progress: number, phase: TransitionPhase) {
  const phaseProgress = clampUnit((progress - phase.start) / (phase.end - phase.start))
  return phaseProgress * phaseProgress * (3 - 2 * phaseProgress)
}

function createInitialState(): ServicesProfileTransitionState {
  return {
    progress: 0,
    profileCardProgress: 0,
    profileTitleProgress: 0,
    servicesContentProgress: 1,
  }
}

export function getServicesProfileTransitionState(
  profileSectionTop: number,
  viewportHeight: number,
): ServicesProfileTransitionState {
  if (
    !Number.isFinite(profileSectionTop) ||
    !Number.isFinite(viewportHeight) ||
    viewportHeight <= 0
  ) {
    return createInitialState()
  }

  const revealedDistance = viewportHeight - profileSectionTop
  const transitionStart = viewportHeight * TRANSITION_START_VIEWPORT_RATIO
  const transitionEnd = viewportHeight * TRANSITION_END_VIEWPORT_RATIO
  const progress = clampUnit(
    (revealedDistance - transitionStart) / (transitionEnd - transitionStart),
  )

  return {
    progress,
    profileCardProgress: mapPhase(progress, PROFILE_CARD_PHASE),
    profileTitleProgress: mapPhase(progress, PROFILE_TITLE_PHASE),
    servicesContentProgress: 1 - mapPhase(progress, SERVICES_EXIT_PHASE),
  }
}

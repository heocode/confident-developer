const TRANSITION_START_VIEWPORT_RATIO = 0.35
const TRANSITION_END_VIEWPORT_RATIO = 1

interface TransitionPhase {
  end: number
  start: number
}

export interface HomeIntroTransitionState {
  heroOpacity: number
  progress: number
  projectCardProgresses: readonly [number, number, number]
  projectsTitleProgress: number
}

const HERO_EXIT_PHASE: TransitionPhase = { start: 0, end: 0.25 }
const PROJECTS_TITLE_PHASE: TransitionPhase = { start: 0.1, end: 0.3 }
const PROJECT_CARD_PHASES: readonly [TransitionPhase, TransitionPhase, TransitionPhase] = [
  { start: 0.3, end: 0.7 },
  { start: 0.45, end: 0.85 },
  { start: 0.6, end: 1 },
]

function clampUnit(value: number) {
  return Math.min(1, Math.max(0, value))
}

function mapPhase(progress: number, phase: TransitionPhase) {
  const phaseProgress = clampUnit((progress - phase.start) / (phase.end - phase.start))
  return phaseProgress * phaseProgress * (3 - 2 * phaseProgress)
}

export function getHomeIntroTransitionState(
  scrollDistance: number,
  viewportHeight: number,
): HomeIntroTransitionState {
  if (!Number.isFinite(scrollDistance) || !Number.isFinite(viewportHeight) || viewportHeight <= 0) {
    return {
      heroOpacity: 1,
      progress: 0,
      projectCardProgresses: [0, 0, 0],
      projectsTitleProgress: 0,
    }
  }

  const transitionStart = viewportHeight * TRANSITION_START_VIEWPORT_RATIO
  const transitionEnd = viewportHeight * TRANSITION_END_VIEWPORT_RATIO
  const progress = clampUnit((scrollDistance - transitionStart) / (transitionEnd - transitionStart))

  return {
    heroOpacity: 1 - mapPhase(progress, HERO_EXIT_PHASE),
    progress,
    projectCardProgresses: PROJECT_CARD_PHASES.map((phase) => mapPhase(progress, phase)) as [
      number,
      number,
      number,
    ],
    projectsTitleProgress: mapPhase(progress, PROJECTS_TITLE_PHASE),
  }
}

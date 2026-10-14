interface TransitionPhase {
  end: number
  start: number
}

export interface ProjectsServicesTransitionState {
  progress: number
  projectsContentProgress: number
  serviceItemProgresses: readonly number[]
  servicesTitleProgress: number
}

const TRANSITION_START_VIEWPORT_RATIO = 0.05
const TRANSITION_END_VIEWPORT_RATIO = 0.92
const PROJECTS_EXIT_PHASE: TransitionPhase = { start: 0.02, end: 0.32 }
const SERVICES_TITLE_PHASE: TransitionPhase = { start: 0.08, end: 0.32 }
const SERVICE_ITEM_PHASES: readonly TransitionPhase[] = [
  { start: 0.56, end: 0.78 },
  { start: 0.64, end: 0.86 },
  { start: 0.72, end: 0.94 },
  { start: 0.78, end: 1 },
]

function clampUnit(value: number) {
  return Math.min(1, Math.max(0, value))
}

function mapPhase(progress: number, phase: TransitionPhase) {
  const phaseProgress = clampUnit((progress - phase.start) / (phase.end - phase.start))
  return phaseProgress * phaseProgress * (3 - 2 * phaseProgress)
}

function createServiceItemProgresses(progress: number, itemCount: number) {
  return Array.from({ length: Math.max(0, itemCount) }, (_, index) => {
    const phase = SERVICE_ITEM_PHASES[index] ?? SERVICE_ITEM_PHASES.at(-1)
    return phase ? mapPhase(progress, phase) : 1
  })
}

function createInitialState(itemCount: number): ProjectsServicesTransitionState {
  return {
    progress: 0,
    projectsContentProgress: 1,
    serviceItemProgresses: createServiceItemProgresses(0, itemCount),
    servicesTitleProgress: 0,
  }
}

export function getProjectsServicesTransitionState(
  servicesSectionTop: number,
  viewportHeight: number,
  serviceItemCount: number,
): ProjectsServicesTransitionState {
  if (
    !Number.isFinite(servicesSectionTop) ||
    !Number.isFinite(viewportHeight) ||
    viewportHeight <= 0
  ) {
    return createInitialState(serviceItemCount)
  }

  const revealedDistance = viewportHeight - servicesSectionTop
  const transitionStart = viewportHeight * TRANSITION_START_VIEWPORT_RATIO
  const transitionEnd = viewportHeight * TRANSITION_END_VIEWPORT_RATIO
  const progress = clampUnit(
    (revealedDistance - transitionStart) / (transitionEnd - transitionStart),
  )

  return {
    progress,
    projectsContentProgress: 1 - mapPhase(progress, PROJECTS_EXIT_PHASE),
    serviceItemProgresses: createServiceItemProgresses(progress, serviceItemCount),
    servicesTitleProgress: mapPhase(progress, SERVICES_TITLE_PHASE),
  }
}

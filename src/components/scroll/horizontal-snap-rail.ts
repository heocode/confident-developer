export interface HorizontalSnapKeyboardTargetInput {
  key: string
  pageRatio: number
  scrollLeft: number
  scrollWidth: number
  viewportWidth: number
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

export function getHorizontalSnapKeyboardTarget({
  key,
  pageRatio,
  scrollLeft,
  scrollWidth,
  viewportWidth,
}: HorizontalSnapKeyboardTargetInput) {
  if (
    !Number.isFinite(pageRatio) ||
    !Number.isFinite(scrollLeft) ||
    !Number.isFinite(scrollWidth) ||
    !Number.isFinite(viewportWidth) ||
    pageRatio <= 0 ||
    scrollWidth <= viewportWidth ||
    viewportWidth <= 0
  ) {
    return null
  }

  const maximumScroll = scrollWidth - viewportWidth
  const currentScroll = clamp(scrollLeft, 0, maximumScroll)
  const pageDistance = viewportWidth * pageRatio
  const targetByKey: Partial<Record<string, number>> = {
    ArrowLeft: currentScroll - pageDistance,
    ArrowRight: currentScroll + pageDistance,
    End: maximumScroll,
    Home: 0,
  }
  const target = targetByKey[key]

  if (target === undefined) return null

  const clampedTarget = clamp(target, 0, maximumScroll)
  return clampedTarget === currentScroll ? null : clampedTarget
}

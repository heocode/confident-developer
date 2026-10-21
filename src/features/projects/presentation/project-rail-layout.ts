export const PROJECT_RAIL_LAYOUT_TOKENS = {
  baseHeight: 560,
  baseWidth: 314,
  desktopMaxScale: 1.4,
  desktopScaleEndWidth: 1440,
  desktopScaleStartWidth: 768,
  horizontalTrackShare: 0.86,
  maxExpandedWidth: 942,
  mobileMaxScale: 1.12,
  panelBlockPadding: 12,
  panelInlinePadding: 16,
} as const

interface ProjectRailLayoutInput {
  containerHeight: number
  containerWidth: number
}

export interface ProjectRailLayout {
  height: number
  scale: number
  width: number
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

export function calculateProjectRailLayout({
  containerHeight,
  containerWidth,
}: ProjectRailLayoutInput): ProjectRailLayout | null {
  if (
    !Number.isFinite(containerHeight) ||
    !Number.isFinite(containerWidth) ||
    containerHeight <= 0 ||
    containerWidth <= 0
  ) {
    return null
  }

  const {
    baseHeight,
    baseWidth,
    desktopMaxScale,
    desktopScaleEndWidth,
    desktopScaleStartWidth,
    horizontalTrackShare,
    mobileMaxScale,
  } = PROJECT_RAIL_LAYOUT_TOKENS
  const desktopProgress = clamp(
    (containerWidth - desktopScaleStartWidth) /
      (desktopScaleEndWidth - desktopScaleStartWidth),
    0,
    1,
  )
  const maximumScale =
    mobileMaxScale + desktopProgress * (desktopMaxScale - mobileMaxScale)
  const scale = Math.min(
    maximumScale,
    (containerWidth * horizontalTrackShare) / baseWidth,
    containerHeight / baseHeight,
  )

  return {
    height: baseHeight * scale,
    scale,
    width: baseWidth * scale,
  }
}

export function calculateExpandedProjectPanelWidth(screenshotAspectRatio: number): number {
  const {
    baseHeight,
    baseWidth,
    maxExpandedWidth,
    panelBlockPadding,
    panelInlinePadding,
  } = PROJECT_RAIL_LAYOUT_TOKENS
  const contentHeight = baseHeight - panelBlockPadding * 2
  const screenshotWidth = contentHeight * screenshotAspectRatio

  return Math.min(
    maxExpandedWidth,
    Math.max(baseWidth, screenshotWidth + panelInlinePadding * 2),
  )
}

export const PROJECT_RAIL_LAYOUT_TOKENS = {
  baseHeight: 560,
  baseWidth: 314,
  desktopMaxScale: 1.4,
  desktopPanelGap: 16,
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
  screenshotAspectRatios: readonly number[]
}

export interface ProjectRailLayout {
  height: number
  scale: number
  screenshotBaseWidths: number[]
  screenshotWidths: number[]
  width: number
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

export function calculateProjectRailLayout({
  containerHeight,
  containerWidth,
  screenshotAspectRatios,
}: ProjectRailLayoutInput): ProjectRailLayout | null {
  if (
    screenshotAspectRatios.length === 0 ||
    screenshotAspectRatios.some(
      (aspectRatio) => !Number.isFinite(aspectRatio) || aspectRatio <= 0,
    ) ||
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
    desktopPanelGap,
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
  const naturalScreenshotBaseWidths = screenshotAspectRatios.map(
    calculateExpandedProjectPanelWidth,
  )
  const naturalScreenshotWidths = naturalScreenshotBaseWidths.map(
    (screenshotWidth) => screenshotWidth * scale,
  )
  const metadataWidth = baseWidth * scale
  const naturalRailWidth =
    naturalScreenshotWidths.reduce((total, screenshotWidth) => total + screenshotWidth, 0) +
    metadataWidth +
    desktopPanelGap * screenshotAspectRatios.length
  const desktopFillWidth =
    containerWidth > desktopScaleStartWidth && naturalRailWidth < containerWidth
      ? (containerWidth - naturalRailWidth) / screenshotAspectRatios.length
      : 0
  const screenshotWidths = naturalScreenshotWidths.map(
    (screenshotWidth) => screenshotWidth + desktopFillWidth,
  )

  return {
    height: baseHeight * scale,
    scale,
    screenshotBaseWidths: screenshotWidths.map((screenshotWidth) => screenshotWidth / scale),
    screenshotWidths,
    width: metadataWidth,
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

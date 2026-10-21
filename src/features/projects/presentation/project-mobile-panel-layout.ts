export const PROJECT_MOBILE_PANEL_TOKENS = {
  baseHeight: 560,
  baseWidth: 314,
  horizontalTrackShare: 0.86,
  maxScale: 1.12,
  panelBlockPadding: 12,
  panelInlinePadding: 16,
} as const

interface ProjectMobilePanelLayoutInput {
  containerHeight: number
  containerWidth: number
}

export interface ProjectMobilePanelLayout {
  height: number
  scale: number
  width: number
}

export function calculateProjectMobilePanelLayout({
  containerHeight,
  containerWidth,
}: ProjectMobilePanelLayoutInput): ProjectMobilePanelLayout {
  const availableWidth = containerWidth * PROJECT_MOBILE_PANEL_TOKENS.horizontalTrackShare
  const scale = Math.min(
    PROJECT_MOBILE_PANEL_TOKENS.maxScale,
    availableWidth / PROJECT_MOBILE_PANEL_TOKENS.baseWidth,
    containerHeight / PROJECT_MOBILE_PANEL_TOKENS.baseHeight,
  )
  const width = PROJECT_MOBILE_PANEL_TOKENS.baseWidth * scale

  return {
    height: PROJECT_MOBILE_PANEL_TOKENS.baseHeight * scale,
    scale,
    width,
  }
}

export function calculateExpandedProjectPanelWidth(
  screenshotAspectRatio: number,
): number {
  const contentHeight =
    PROJECT_MOBILE_PANEL_TOKENS.baseHeight -
    PROJECT_MOBILE_PANEL_TOKENS.panelBlockPadding * 2
  const screenshotWidth = contentHeight * screenshotAspectRatio

  return Math.max(
    PROJECT_MOBILE_PANEL_TOKENS.baseWidth,
    screenshotWidth + PROJECT_MOBILE_PANEL_TOKENS.panelInlinePadding * 2,
  )
}

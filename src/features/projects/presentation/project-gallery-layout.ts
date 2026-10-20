export interface ProjectGalleryLayoutScreenshot {
  aspectRatio: number
  layoutWeight: number
}

export interface ProjectGalleryLayout {
  galleryWidth: number
  screenshotWidths: number[]
}

export const PROJECT_GALLERY_LAYOUT_TOKENS = {
  gap: 10,
  metadataMaxWidth: 410,
  metadataMinWidth: 320,
  metadataPreferredFraction: 0.313,
  panelBlockPadding: 15,
  panelInlinePadding: 16,
} as const

interface ProjectGalleryLayoutInput {
  containerHeight: number
  containerWidth: number
  screenshots: ProjectGalleryLayoutScreenshot[]
}

export function calculateProjectGalleryLayout({
  containerHeight,
  containerWidth,
  screenshots,
}: ProjectGalleryLayoutInput): ProjectGalleryLayout | null {
  if (
    screenshots.length === 0 ||
    !Number.isFinite(containerHeight) ||
    !Number.isFinite(containerWidth) ||
    containerHeight <= 0 ||
    containerWidth <= 0
  ) {
    return null
  }

  const {
    gap,
    metadataMaxWidth,
    metadataMinWidth,
    metadataPreferredFraction,
    panelBlockPadding,
    panelInlinePadding,
  } = PROJECT_GALLERY_LAYOUT_TOKENS
  const galleryGapsWidth = gap * (screenshots.length - 1)
  const panelPaddingWidth = panelInlinePadding * 2
  const imageHeight = Math.max(0, containerHeight - panelBlockPadding * 2)
  const naturalScreenshotWidths = screenshots.map(
    ({ aspectRatio }) => imageHeight * aspectRatio + panelPaddingWidth,
  )
  const naturalGalleryWidth =
    naturalScreenshotWidths.reduce((total, width) => total + width, 0) + galleryGapsWidth
  const preferredMetadataWidth = Math.min(
    metadataMaxWidth,
    Math.max(metadataMinWidth, containerWidth * metadataPreferredFraction),
  )
  const preferredGalleryWidth = Math.max(0, containerWidth - gap - preferredMetadataWidth)
  const maximumGalleryWidth = Math.max(0, containerWidth - gap - metadataMinWidth)

  if (naturalGalleryWidth <= preferredGalleryWidth) {
    const extraPanelWidth =
      (preferredGalleryWidth - naturalGalleryWidth) / screenshots.length

    return {
      galleryWidth: preferredGalleryWidth,
      screenshotWidths: naturalScreenshotWidths.map((width) => width + extraPanelWidth),
    }
  }

  if (naturalGalleryWidth <= maximumGalleryWidth) {
    return {
      galleryWidth: naturalGalleryWidth,
      screenshotWidths: naturalScreenshotWidths,
    }
  }

  const availableImageWidth = Math.max(
    0,
    maximumGalleryWidth - galleryGapsWidth - panelPaddingWidth * screenshots.length,
  )
  const totalLayoutWeight = screenshots.reduce(
    (total, screenshot) => total + screenshot.layoutWeight,
    0,
  )
  const screenshotWidths = screenshots.map(
    ({ layoutWeight }) =>
      panelPaddingWidth + availableImageWidth * (layoutWeight / totalLayoutWeight),
  )

  return {
    galleryWidth: screenshotWidths.reduce((total, width) => total + width, 0) + galleryGapsWidth,
    screenshotWidths,
  }
}

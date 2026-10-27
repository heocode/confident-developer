export interface DocumentScrollGeometryInput {
  minimumThumbHeight: number
  scrollHeight: number
  scrollTop: number
  trackHeight: number
  viewportHeight: number
}

export interface DocumentScrollGeometry {
  maximumScroll: number
  maximumThumbOffset: number
  progress: number
  thumbHeight: number
  thumbOffset: number
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

export function getDocumentScrollGeometry({
  minimumThumbHeight,
  scrollHeight,
  scrollTop,
  trackHeight,
  viewportHeight,
}: DocumentScrollGeometryInput): DocumentScrollGeometry | null {
  if (
    !Number.isFinite(scrollHeight) ||
    !Number.isFinite(viewportHeight) ||
    !Number.isFinite(trackHeight) ||
    scrollHeight <= viewportHeight ||
    viewportHeight <= 0 ||
    trackHeight <= 0
  ) {
    return null
  }

  const maximumScroll = scrollHeight - viewportHeight
  const thumbHeight = clamp(
    (viewportHeight / scrollHeight) * trackHeight,
    Math.min(minimumThumbHeight, trackHeight),
    trackHeight,
  )
  const maximumThumbOffset = Math.max(0, trackHeight - thumbHeight)
  const progress = clamp(scrollTop / maximumScroll, 0, 1)

  return {
    maximumScroll,
    maximumThumbOffset,
    progress,
    thumbHeight,
    thumbOffset: progress * maximumThumbOffset,
  }
}

export function getScrollTopFromThumbPosition(
  pointerPosition: number,
  dragOffset: number,
  geometry: DocumentScrollGeometry,
) {
  if (geometry.maximumThumbOffset === 0) return 0

  const thumbOffset = clamp(
    pointerPosition - dragOffset,
    0,
    geometry.maximumThumbOffset,
  )

  return (thumbOffset / geometry.maximumThumbOffset) * geometry.maximumScroll
}

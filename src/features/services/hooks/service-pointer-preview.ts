interface ServicePointerPreviewWidthOptions {
  actionInset: number
  actionWidth: number
  baseWidth: number
  maximumWidth: number
  pointerOffsetX: number
}

export function getServicePointerPreviewWidth({
  actionInset,
  actionWidth,
  baseWidth,
  maximumWidth,
  pointerOffsetX,
}: ServicePointerPreviewWidthOptions) {
  const safeMaximumWidth = Math.max(baseWidth, maximumWidth)
  const minimumPreviewWidth = Math.min(
    baseWidth + actionWidth + actionInset,
    safeMaximumWidth,
  )
  const pointerAlignedWidth = pointerOffsetX + actionWidth / 2 + actionInset

  return Math.min(Math.max(pointerAlignedWidth, minimumPreviewWidth), safeMaximumWidth)
}

export function getServiceKeyboardPreviewWidth(
  baseWidth: number,
  maximumWidth: number,
  actionWidth: number,
  actionInset: number,
) {
  const safeMaximumWidth = Math.max(baseWidth, maximumWidth)
  const minimumPreviewWidth = Math.min(
    baseWidth + actionWidth + actionInset,
    safeMaximumWidth,
  )

  return Math.max(
    minimumPreviewWidth,
    baseWidth + (safeMaximumWidth - baseWidth) * 0.7,
  )
}

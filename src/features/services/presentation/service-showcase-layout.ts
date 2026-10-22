export const SERVICE_SHOWCASE_LAYOUT_TOKENS = {
  baseHeight: 560,
  basePanelWidth: 290,
  compactPanelSize: 180,
  compactItemsPerColumn: 3,
  desktopMaxScale: 1.4,
  expandedAspectRatio: 0.8,
  gap: 10,
  informationPanelWidth: 530,
  maxInformationPanelWidth: 742,
  maxPanelWidth: 720,
  panelBlockPadding: 16,
  panelInlinePadding: 22,
} as const

interface ServiceShowcaseAssetLike {
  kind: 'animation' | 'image' | 'video'
}

export interface ServiceShowcaseGroup<T extends ServiceShowcaseAssetLike> {
  assets: T[]
  kind: 'compact' | 'full'
}

interface ServiceShowcaseLayoutInput {
  containerHeight: number
  containerWidth: number
  groups: readonly ServiceShowcaseGroup<ServiceShowcaseAssetLike>[]
  groupAspectRatios: readonly number[]
}

export interface ServiceShowcaseLayout {
  compactPanelSize: number
  gap: number
  groupWidths: number[]
  height: number
  informationPanelWidth: number
  scale: number
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

export function groupServiceShowcaseAssets<T extends ServiceShowcaseAssetLike>(
  assets: readonly T[],
  compactItemsPerColumn: number = SERVICE_SHOWCASE_LAYOUT_TOKENS.compactItemsPerColumn,
): ServiceShowcaseGroup<T>[] {
  const groups: ServiceShowcaseGroup<T>[] = []

  for (const asset of assets) {
    const previousGroup = groups.at(-1)
    const canJoinPreviousGroup =
      asset.kind === 'animation' &&
      previousGroup?.kind === 'compact' &&
      previousGroup.assets.length < compactItemsPerColumn

    if (canJoinPreviousGroup) {
      previousGroup.assets.push(asset)
      continue
    }

    groups.push({
      assets: [asset],
      kind: asset.kind === 'animation' ? 'compact' : 'full',
    })
  }

  return groups
}

export function calculateServiceShowcasePanelWidth(
  aspectRatio: number,
  panelHeight: number = SERVICE_SHOWCASE_LAYOUT_TOKENS.baseHeight,
) {
  const {
    baseHeight,
    basePanelWidth,
    desktopMaxScale,
    expandedAspectRatio,
    maxPanelWidth,
    panelBlockPadding,
    panelInlinePadding,
  } = SERVICE_SHOWCASE_LAYOUT_TOKENS
  const scale = Math.min(
    desktopMaxScale,
    Math.max(1, panelHeight / baseHeight),
  )

  if (aspectRatio <= expandedAspectRatio) return basePanelWidth * scale

  const contentHeight = Math.max(
    0,
    panelHeight - panelBlockPadding * scale * 2,
  )

  return clamp(
    contentHeight * aspectRatio + panelInlinePadding * scale * 2,
    basePanelWidth * scale,
    maxPanelWidth * scale,
  )
}

export function calculateServiceShowcaseLayout({
  containerHeight,
  containerWidth,
  groupAspectRatios,
  groups,
}: ServiceShowcaseLayoutInput): ServiceShowcaseLayout | null {
  if (
    groups.length === 0 ||
    groupAspectRatios.length !== groups.length ||
    groupAspectRatios.some(
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
    compactItemsPerColumn,
    desktopMaxScale,
    gap: baseGap,
    informationPanelWidth,
    maxInformationPanelWidth,
  } = SERVICE_SHOWCASE_LAYOUT_TOKENS
  const height = Math.min(containerHeight, baseHeight * desktopMaxScale)
  const scale = Math.min(
    desktopMaxScale,
    Math.max(1, height / baseHeight),
  )
  const gap = baseGap * scale
  const fittedCompactPanelSize =
    (height - gap * (compactItemsPerColumn - 1)) / compactItemsPerColumn
  const groupWidths = groups.map((group, index) =>
    group.kind === 'compact'
      ? fittedCompactPanelSize
      : calculateServiceShowcasePanelWidth(groupAspectRatios[index], height),
  )
  const remainingInformationWidth =
    containerWidth -
    groupWidths.reduce((totalWidth, groupWidth) => totalWidth + groupWidth, 0) -
    gap * groups.length

  return {
    compactPanelSize: fittedCompactPanelSize,
    gap,
    groupWidths,
    height,
    informationPanelWidth: clamp(
      remainingInformationWidth,
      informationPanelWidth,
      maxInformationPanelWidth,
    ),
    scale,
  }
}

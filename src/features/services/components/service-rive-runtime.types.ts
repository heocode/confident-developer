export interface ServiceRiveController {
  assetId: string
  pause: () => void
  play: () => void
  setHovered: (isHovered: boolean) => void
}

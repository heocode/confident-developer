import { useEffect } from 'react'

export function useReferenceModalPageLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return

    const root = document.documentElement
    const scrollbarCompensation = Math.max(0, window.innerWidth - root.clientWidth)
    const previousOverflow = root.style.overflow
    const previousPaddingRight = root.style.paddingRight
    const previousScrollbarGutter = root.style.scrollbarGutter
    const previousCompensation = root.style.getPropertyValue('--modal-scrollbar-compensation')

    root.style.setProperty('--modal-scrollbar-compensation', `${scrollbarCompensation}px`)
    root.style.scrollbarGutter = 'auto'
    root.style.paddingRight = `${scrollbarCompensation}px`
    root.style.overflow = 'hidden'

    return () => {
      root.style.overflow = previousOverflow
      root.style.paddingRight = previousPaddingRight
      root.style.scrollbarGutter = previousScrollbarGutter
      if (previousCompensation) {
        root.style.setProperty('--modal-scrollbar-compensation', previousCompensation)
      } else {
        root.style.removeProperty('--modal-scrollbar-compensation')
      }
    }
  }, [isOpen])
}

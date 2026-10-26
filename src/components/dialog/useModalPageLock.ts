import { useEffect } from 'react'

export function useModalPageLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return

    const root = document.documentElement
    const previousOverflow = root.style.overflow

    root.style.overflow = 'hidden'

    return () => {
      root.style.overflow = previousOverflow
    }
  }, [isOpen])
}

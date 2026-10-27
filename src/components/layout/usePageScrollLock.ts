import { useLayoutEffect, useRef } from 'react'

import { acquirePageScrollLock } from './page-scroll-lock.ts'

export function usePageScrollLock(isLocked: boolean, owner: string) {
  const tokenRef = useRef(Symbol(owner))

  useLayoutEffect(() => {
    if (!isLocked) return
    return acquirePageScrollLock(tokenRef.current)
  }, [isLocked])
}

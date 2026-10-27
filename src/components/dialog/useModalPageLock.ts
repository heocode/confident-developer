import { usePageScrollLock } from '../layout/usePageScrollLock.ts'

export function useModalPageLock(isOpen: boolean) {
  usePageScrollLock(isOpen, 'modal')
}

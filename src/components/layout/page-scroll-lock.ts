export class PageScrollLockRegistry {
  readonly #locks = new Set<symbol>()

  acquire(token: symbol) {
    this.#locks.add(token)
    return this.isLocked
  }

  release(token: symbol) {
    this.#locks.delete(token)
    return this.isLocked
  }

  get isLocked() {
    return this.#locks.size > 0
  }

  get size() {
    return this.#locks.size
  }
}

const pageScrollLocks = new PageScrollLockRegistry()

function syncRootScrollLock() {
  document.documentElement.toggleAttribute(
    'data-page-scroll-locked',
    pageScrollLocks.isLocked,
  )
}

export function acquirePageScrollLock(token: symbol) {
  pageScrollLocks.acquire(token)
  syncRootScrollLock()

  return () => {
    pageScrollLocks.release(token)
    syncRootScrollLock()
  }
}

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { PageScrollLockRegistry } from '../../../src/components/layout/page-scroll-lock.ts'

describe('Page scroll lock registry', () => {
  it('keeps the page locked until every independent owner releases', () => {
    const registry = new PageScrollLockRegistry()
    const routeLock = Symbol('viewport-route')
    const modalLock = Symbol('modal')

    assert.equal(registry.acquire(routeLock), true)
    assert.equal(registry.acquire(modalLock), true)
    assert.equal(registry.size, 2)

    assert.equal(registry.release(routeLock), true)
    assert.equal(registry.size, 1)
    assert.equal(registry.release(modalLock), false)
    assert.equal(registry.size, 0)
  })

  it('treats repeated work from the same owner as one lock', () => {
    const registry = new PageScrollLockRegistry()
    const token = Symbol('strict-mode-owner')

    registry.acquire(token)
    registry.acquire(token)

    assert.equal(registry.size, 1)
    assert.equal(registry.release(token), false)
  })

  it('ignores releases from owners that do not hold a lock', () => {
    const registry = new PageScrollLockRegistry()

    assert.equal(registry.release(Symbol('unknown')), false)
    assert.equal(registry.size, 0)
  })
})

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  findPrimaryRoute,
  getRouteTransitionDirection,
} from '../../../src/components/layout/route-transitions/primary-routes.ts'
import { shouldHandleRouteTransitionActivation } from '../../../src/components/layout/route-transitions/route-transition-activation.ts'
import { resolvePrimaryRouteMotion } from '../../../src/components/layout/route-transitions/usePrimaryRouteMotion.ts'

describe('Primary route resolution', () => {
  it('maps nested project and service URLs to their primary navigation areas', () => {
    assert.equal(findPrimaryRoute('/projects/portfolio')?.id, 'projects')
    assert.equal(findPrimaryRoute('/services/product-ui-ux')?.id, 'services')
  })

  it('normalizes trailing slashes without treating Home as a parent route', () => {
    assert.equal(findPrimaryRoute('/')?.id, 'home')
    assert.equal(findPrimaryRoute('/references/')?.id, 'references')
    assert.equal(findPrimaryRoute('/unknown'), null)
  })
})

describe('Primary route transition direction', () => {
  it('moves forward and backward according to navigation order', () => {
    assert.equal(
      getRouteTransitionDirection(
        findPrimaryRoute('/'),
        findPrimaryRoute('/services'),
      ),
      'forward',
    )
    assert.equal(
      getRouteTransitionDirection(
        findPrimaryRoute('/references'),
        findPrimaryRoute('/projects'),
      ),
      'backward',
    )
  })

  it('bypasses navigation within the same primary route', () => {
    assert.equal(
      getRouteTransitionDirection(
        findPrimaryRoute('/services/product-ui-ux'),
        findPrimaryRoute('/services'),
      ),
      null,
    )
  })

  it('jumps directly to the requested route without resolving intermediate routes', () => {
    const direction = getRouteTransitionDirection(
      findPrimaryRoute('/'),
      findPrimaryRoute('/contact'),
    )

    assert.equal(direction, 'forward')
  })
})

describe('Desktop navigation transition activation', () => {
  const primaryActivation = {
    altKey: false,
    button: 0,
    ctrlKey: false,
    defaultPrevented: false,
    metaKey: false,
    shiftKey: false,
  }

  it('handles an unmodified desktop activation', () => {
    assert.equal(
      shouldHandleRouteTransitionActivation(primaryActivation, {
        isDesktop: true,
        prefersReducedMotion: false,
      }),
      true,
    )
  })

  it('bypasses mobile and reduced-motion navigation', () => {
    assert.equal(
      shouldHandleRouteTransitionActivation(primaryActivation, {
        isDesktop: false,
        prefersReducedMotion: false,
      }),
      false,
    )
    assert.equal(
      shouldHandleRouteTransitionActivation(primaryActivation, {
        isDesktop: true,
        prefersReducedMotion: true,
      }),
      false,
    )
  })

  it('preserves modified, non-primary, and previously handled clicks', () => {
    assert.equal(
      shouldHandleRouteTransitionActivation(
        { ...primaryActivation, metaKey: true },
        { isDesktop: true, prefersReducedMotion: false },
      ),
      false,
    )
    assert.equal(
      shouldHandleRouteTransitionActivation(
        { ...primaryActivation, button: 1 },
        { isDesktop: true, prefersReducedMotion: false },
      ),
      false,
    )
    assert.equal(
      shouldHandleRouteTransitionActivation(
        { ...primaryActivation, defaultPrevented: true },
        { isDesktop: true, prefersReducedMotion: false },
      ),
      false,
    )
  })
})

describe('Primary route-owned motion', () => {
  it('exposes exit motion only to the source route', () => {
    const transition = {
      direction: 'forward' as const,
      id: 4,
      phase: 'leaving' as const,
      source: 'projects' as const,
      target: 'services' as const,
    }

    assert.deepEqual(resolvePrimaryRouteMotion(transition, 'projects'), {
      direction: 'forward',
      phase: 'leaving',
      transitionId: 4,
    })
    assert.equal(resolvePrimaryRouteMotion(transition, 'services').phase, 'idle')
  })

  it('exposes entrance motion only to the destination route', () => {
    const transition = {
      direction: 'backward' as const,
      id: 7,
      phase: 'entering' as const,
      source: 'contact' as const,
      target: 'projects' as const,
    }

    assert.deepEqual(resolvePrimaryRouteMotion(transition, 'projects'), {
      direction: 'backward',
      phase: 'entering',
      transitionId: 7,
    })
    assert.equal(resolvePrimaryRouteMotion(transition, 'contact').phase, 'idle')
  })

  it('does not expose route-owned motion while the coordinator is idle or switching', () => {
    assert.equal(
      resolvePrimaryRouteMotion(
        {
          direction: null,
          id: 8,
          phase: 'idle',
          source: null,
          target: null,
        },
        'projects',
      ).phase,
      'idle',
    )
    assert.equal(
      resolvePrimaryRouteMotion(
        {
          direction: 'forward',
          id: 9,
          phase: 'switching',
          source: 'home',
          target: 'projects',
        },
        'projects',
      ).phase,
      'idle',
    )
  })
})

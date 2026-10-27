import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { ServiceSummaryPresentation } from '../../../src/features/services/presentation/services-page.ts'
import { getServiceRouteItemMotion } from '../../../src/features/services/routes/service-primary-route-motion.ts'
import {
  createServiceOpeningGeometry,
  shouldAnimateServiceTransition,
} from '../../../src/features/services/routes/service-route-motion.ts'

const service: ServiceSummaryPresentation = {
  description: 'Service description',
  icon: { height: 84, src: '/service.svg', width: 84 },
  id: 'service-id',
  slug: 'service-slug',
  title: 'Service title',
  tone: {
    color: '#abcdef',
    key: 'web',
    surfaceColor: '#123456',
  },
}

describe('Service opening transition geometry', () => {
  it('converts viewport measurements into Services content coordinates', () => {
    const geometry = createServiceOpeningGeometry(
      {
        actionRect: { height: 84, left: 900, top: 460, width: 84 },
        service,
        surfaceRect: { height: 180, left: 0, top: 410, width: 1020 },
      },
      { height: 720, left: 0, top: 230, width: 1280 },
    )

    assert.deepEqual(geometry.surfaceRect, {
      height: 180,
      left: 0,
      top: 180,
      width: 1020,
    })
    assert.deepEqual(geometry.actionRect, {
      height: 84,
      left: 900,
      top: 230,
      width: 84,
    })
  })
})

describe('Service route transition activation', () => {
  const activation = {
    altKey: false,
    button: 0,
    ctrlKey: false,
    detail: 1,
    metaKey: false,
    shiftKey: false,
  }

  it('animates an unmodified primary activation on the mobile layout', () => {
    assert.equal(
      shouldAnimateServiceTransition(
        activation,
        (query) => query === '(max-width: 48rem)',
      ),
      true,
    )
  })

  it('keeps coarse-pointer desktop navigation immediate', () => {
    assert.equal(shouldAnimateServiceTransition(activation, () => false), false)
  })

  it('preserves modified-link navigation', () => {
    assert.equal(
      shouldAnimateServiceTransition(
        { ...activation, metaKey: true },
        () => true,
      ),
      false,
    )
    assert.equal(
      shouldAnimateServiceTransition({ ...activation, button: 1 }, () => true),
      false,
    )
  })
})

describe('Service primary-route stagger', () => {
  it('enters from the first row and completes on the last row', () => {
    const motions = Array.from({ length: 4 }, (_, index) =>
      getServiceRouteItemMotion(index, 4, 'entering'),
    )

    assert.deepEqual(
      motions.map(({ delayMs }) => delayMs),
      [0, 40, 80, 120],
    )
    assert.deepEqual(
      motions.map(({ isTerminal }) => isTerminal),
      [false, false, false, true],
    )
  })

  it('leaves from the last row and completes on the first row', () => {
    const motions = Array.from({ length: 4 }, (_, index) =>
      getServiceRouteItemMotion(index, 4, 'leaving'),
    )

    assert.deepEqual(
      motions.map(({ delayMs }) => delayMs),
      [120, 80, 40, 0],
    )
    assert.deepEqual(
      motions.map(({ isTerminal }) => isTerminal),
      [true, false, false, false],
    )
  })

  it('caps the complete stagger independently of the service count', () => {
    const lastMotion = getServiceRouteItemMotion(9, 10, 'entering')

    assert.equal(lastMotion.delayMs, 120)
    assert.equal(lastMotion.isTerminal, true)
  })

  it('does not expose a terminal item while route motion is idle', () => {
    assert.deepEqual(getServiceRouteItemMotion(0, 1, 'idle'), {
      delayMs: 0,
      isTerminal: false,
    })
  })
})

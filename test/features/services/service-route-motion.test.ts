import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { ServiceSummaryPresentation } from '../../../src/features/services/presentation/services-page.ts'
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

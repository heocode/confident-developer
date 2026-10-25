import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { ServiceSummaryPresentation } from '../../../src/features/services/presentation/services-page.ts'
import {
  createServiceOpeningGeometry,
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

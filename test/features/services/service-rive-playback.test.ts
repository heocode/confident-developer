import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  getServiceRivePlaybackIntent,
  selectServiceRiveStateMachine,
} from '../../../src/features/services/presentation/service-rive-playback.ts'

const visibleConditions = {
  allAssetsSettled: true,
  hasStarted: false,
  isDocumentVisible: true,
  isStackVisible: true,
  prefersReducedMotion: false,
}

describe('Service Rive state machine selection', () => {
  it('selects the only state machine exported by an asset', () => {
    assert.deepEqual(selectServiceRiveStateMachine(['LaunchAnimation']), {
      issue: null,
      machineName: 'LaunchAnimation',
    })
  })

  it('rejects an asset without a state machine', () => {
    assert.deepEqual(selectServiceRiveStateMachine([]), {
      issue: 'missing-state-machine',
      machineName: null,
    })
  })

  it('rejects an ambiguous asset instead of guessing a machine', () => {
    assert.deepEqual(selectServiceRiveStateMachine(['First', 'Second']), {
      issue: 'ambiguous-state-machine',
      machineName: null,
    })
  })
})

describe('Service Rive playback intent', () => {
  it('waits for every asset to settle before the synchronized start', () => {
    assert.equal(
      getServiceRivePlaybackIntent({
        ...visibleConditions,
        allAssetsSettled: false,
      }),
      'preview',
    )
  })

  it('starts when the complete stack becomes ready and visible', () => {
    assert.equal(getServiceRivePlaybackIntent(visibleConditions), 'start')
  })

  it('keeps previews when reduced motion is preferred', () => {
    assert.equal(
      getServiceRivePlaybackIntent({
        ...visibleConditions,
        prefersReducedMotion: true,
      }),
      'preview',
    )
  })

  it('pauses a started stack outside the rail or a visible document', () => {
    assert.equal(
      getServiceRivePlaybackIntent({
        ...visibleConditions,
        hasStarted: true,
        isStackVisible: false,
      }),
      'pause',
    )
    assert.equal(
      getServiceRivePlaybackIntent({
        ...visibleConditions,
        hasStarted: true,
        isDocumentVisible: false,
      }),
      'pause',
    )
  })

  it('resumes a started stack when it becomes visible again', () => {
    assert.equal(
      getServiceRivePlaybackIntent({
        ...visibleConditions,
        hasStarted: true,
      }),
      'play',
    )
  })
})

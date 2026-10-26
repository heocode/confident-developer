import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getServiceVideoPlaybackIntent } from '../../../src/features/services/presentation/service-video-playback.ts'

const playableConditions = {
  hasActivated: true,
  hasEnded: false,
  hasFailed: false,
  isDocumentVisible: true,
  isPanelVisible: true,
  manualPlaybackRequested: false,
  prefersReducedMotion: false,
}

describe('Service video playback intent', () => {
  it('keeps the source idle before the panel activates', () => {
    assert.equal(
      getServiceVideoPlaybackIntent({
        ...playableConditions,
        hasActivated: false,
      }),
      'idle',
    )
  })

  it('plays an activated video while its panel and document are visible', () => {
    assert.equal(getServiceVideoPlaybackIntent(playableConditions), 'play')
  })

  it('pauses without resetting when the panel leaves the rail', () => {
    assert.equal(
      getServiceVideoPlaybackIntent({
        ...playableConditions,
        isPanelVisible: false,
      }),
      'pause',
    )
  })

  it('does not autoplay after the video ends', () => {
    assert.equal(
      getServiceVideoPlaybackIntent({ ...playableConditions, hasEnded: true }),
      'pause',
    )
  })

  it('requires a manual request when reduced motion is preferred', () => {
    assert.equal(
      getServiceVideoPlaybackIntent({
        ...playableConditions,
        prefersReducedMotion: true,
      }),
      'pause',
    )
    assert.equal(
      getServiceVideoPlaybackIntent({
        ...playableConditions,
        manualPlaybackRequested: true,
        prefersReducedMotion: true,
      }),
      'play',
    )
  })

  it('stays paused after a media failure', () => {
    assert.equal(
      getServiceVideoPlaybackIntent({ ...playableConditions, hasFailed: true }),
      'pause',
    )
  })
})

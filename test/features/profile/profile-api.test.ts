import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'

import { getGitHubSummary } from '../../../src/features/profile/api/github-summary-api.ts'
import { PROFILE_RESUME_DOWNLOAD_PATH } from '../../../src/features/profile/api/profile-api.ts'
import {
  getProfilePost,
  getProfilePostInteraction,
  likeProfilePost,
  recordProfilePostView,
  unlikeProfilePost,
} from '../../../src/features/profile/api/profile-post-api.ts'

const originalFetch = globalThis.fetch

function jsonResponse(data: unknown) {
  return new Response(JSON.stringify({ success: true, message: 'Retrieved.', data }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('Profile API', () => {
  it('loads the GitHub summary and profile post from their public endpoints', async () => {
    const requestedPaths: Array<RequestInfo | URL> = []

    globalThis.fetch = async (input) => {
      requestedPaths.push(input)

      if (input === '/api/v1/github-summary') {
        return jsonResponse({ repositoryCount: 12, languageCount: 7, refreshedAt: '2026-10-14T12:00:00.000Z' })
      }

      return jsonResponse({
        id: 'post-1',
        text: 'Synthetic profile post.',
        revision: 4,
        contentUpdatedAt: '2026-10-14T12:00:00.000Z',
        likes: 9,
        views: 24,
      })
    }

    const [summary, post] = await Promise.all([getGitHubSummary(), getProfilePost()])

    assert.deepEqual(requestedPaths, ['/api/v1/github-summary', '/api/v1/profile-post'])
    assert.equal(summary.repositoryCount, 12)
    assert.equal(post.revision, 4)
  })

  it('requests private interaction state without mutating it', async () => {
    let requestedInput: RequestInfo | URL | undefined
    let requestedInit: RequestInit | undefined

    globalThis.fetch = async (input, init) => {
      requestedInput = input
      requestedInit = init
      return jsonResponse({ revision: 4, likes: 9, liked: false })
    }

    const interaction = await getProfilePostInteraction(4)

    assert.equal(requestedInput, '/api/v1/profile-post/interaction?revision=4')
    assert.equal(requestedInit?.method, 'GET')
    assert.equal(interaction.liked, false)
  })

  it('maps like, unlike, and view actions to the intended methods and bodies', async () => {
    const requests: Array<{ input: RequestInfo | URL; init?: RequestInit }> = []

    globalThis.fetch = async (input, init) => {
      requests.push({ input, init })
      const isView = input === '/api/v1/profile-post/view'
      return jsonResponse(
        isView
          ? { revision: 4, views: 25, recorded: true }
          : { revision: 4, likes: 10, liked: init?.method === 'PUT' },
      )
    }

    await likeProfilePost(4)
    await unlikeProfilePost(4)
    await recordProfilePostView(4)

    assert.deepEqual(
      requests.map(({ input, init }) => ({ input, method: init?.method, body: init?.body })),
      [
        { input: '/api/v1/profile-post/like', method: 'PUT', body: '{"revision":4}' },
        { input: '/api/v1/profile-post/like', method: 'DELETE', body: '{"revision":4}' },
        { input: '/api/v1/profile-post/view', method: 'POST', body: '{"revision":4}' },
      ],
    )
  })

  it('rejects invalid revisions before sending a request', async () => {
    let requested = false
    globalThis.fetch = async () => {
      requested = true
      return jsonResponse(null)
    }

    for (const revision of [0, -1, 1.5, Number.NaN]) {
      assert.throws(() => likeProfilePost(revision), /positive integer/)
      assert.throws(() => getProfilePostInteraction(revision), /positive integer/)
    }

    assert.equal(requested, false)
  })

  it('keeps the resume download on a relative browser path', () => {
    assert.equal(PROFILE_RESUME_DOWNLOAD_PATH, '/api/v1/profile/resume')
  })
})

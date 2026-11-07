/**
 * Tier-hierarchy smoke test for the OSS Issues API gate.
 *
 * The platform gates on RANK — public < member < friend < service < wife <
 * admin — so a route gated at `friend` must admit friend, service, wife, and
 * admin, and refuse public and member. This is the property that used to
 * break: the gate was an allowlist (`['admin','friend','service']`) and every
 * new caller tier had to be remembered and added by hand. Here we assert the
 * rank behaviour directly, by looping over the platform's own `TIER_RANK`
 * rather than a hand-typed tier list, so a regression to exact-match gating
 * fails the build instead of silently 403ing a legitimate higher-tier caller,
 * and a tier added to the ladder later is covered with no edit here.
 *
 * Auth arrives the way it does in production: edge-router stamps
 * `X-Hadoku-Tier` and proves provenance with `X-Edge-Auth` (createEdgeAuth
 * trusts the tier only when the shared secret matches, otherwise the caller
 * degrades to public).
 */

import { describe, it, expect } from 'vitest'
import { TIER_RANK } from '@wolffm/worker-utils'
import { createOSSHandler } from './handler'

const EDGE_SECRET = 'test-edge-auth-secret'
const BASE = '/oss/api'

// A mutating route: gated at friend and up. GET stays public.
const WRITE_PATH = `${BASE}/fastify-fastify/refresh`

function request(headers: Record<string, string>, method = 'POST') {
  const app = createOSSHandler(BASE)
  return app.fetch(
    new Request(`http://localhost${WRITE_PATH}`, { method, headers }),
    // No SCRAPER_API_URL: a caller that PASSES the gate falls through to the
    // handler's own 500 for the unconfigured upstream. That is the signal we
    // want — "not 403" means the tier was admitted, without needing a live
    // scraper. A blocked caller never reaches the handler at all.
    { EDGE_AUTH_SECRET: EDGE_SECRET },
    { waitUntil: () => {}, passThroughOnException: () => {} } as unknown as ExecutionContext
  )
}

/** Headers for an edge-proxied request resolved to `tier`. */
function asTier(tier: string) {
  return { 'X-Edge-Auth': EDGE_SECRET, 'X-Hadoku-Tier': tier }
}

describe('tier hierarchy at the write gate', () => {
  it('admits every tier at or above friend, blocks every tier below it', async () => {
    // Derived from the platform's own TIER_RANK rather than a hand-typed tier
    // list, so a tier added above or below the floor is covered without
    // anyone editing this loop. member (rank 1) must stay below friend (rank
    // 2) on its own merits, not because it was forgotten.
    for (const tier of Object.keys(TIER_RANK)) {
      const res = await request(asTier(tier))
      const wantBlocked = TIER_RANK[tier as keyof typeof TIER_RANK] < TIER_RANK.friend
      expect(res.status === 403, tier).toBe(wantBlocked)
    }
  })

  it('blocks an unknown tier — no rank means no access', async () => {
    // Guards the fallback in tierAtLeast: a userType outside the hierarchy has
    // rank -1, so it must never satisfy even the lowest gate.
    const res = await request(asTier('authenticated'))
    expect(res.status).toBe(403)
  })

  it('degrades a forged tier to public when provenance is missing', async () => {
    // A direct *.workers.dev hit claiming admin: no X-Edge-Auth, so the stamped
    // tier is not believed and the in-worker gate is the backstop.
    const res = await request({ 'X-Hadoku-Tier': 'admin' })
    expect(res.status).toBe(403)
  })

  it('leaves reads public', async () => {
    const app = createOSSHandler(BASE)
    const res = await app.fetch(
      new Request(`http://localhost${BASE}/health`),
      { EDGE_AUTH_SECRET: EDGE_SECRET },
      { waitUntil: () => {}, passThroughOnException: () => {} } as unknown as ExecutionContext
    )
    expect(res.status).toBe(200)
  })
})

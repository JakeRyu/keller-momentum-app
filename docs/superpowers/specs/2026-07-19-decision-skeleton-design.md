# Decision Skeleton Loading — Design

Date: 2026-07-19
Scope: `web/` only. Improves the loading state of the strategy decision
area on `StrategyPage`.

## Problem

`DecisionTool` shows a single small muted line (`Fetching decision…`)
while the backend pulls live Yahoo data, which takes 5–15 seconds. The
message is easy to miss, has no motion, and the decision area renders
as a large void during the wait. On PAA, changing the protection factor
(a=0/1/2) refetches with **no** loading indication at all — the stale
result stays on screen and can be misread as the new setting's result.

## Decision

Replace the text line with a skeleton layout that mirrors the decision
spread, shown during every fetch (initial load and PAA refetch alike).

## Design

### New component: `web/src/components/DecisionSkeleton.tsx`

Props: `{ strategy: Strategy }`.

Renders pure gray placeholder blocks (no real tickers, no real bucket
labels) mirroring `DecisionCard`'s structure:

1. **Caption** — small mono caps `FETCHING LIVE MARKET DATA…` where the
   `STATE · …` pill normally sits. The only real text in the skeleton.
2. **Decision spread** — same `.decision-spread` grid: a large block
   approximating the hero ticker (left 2/3) and 3–4 short line blocks
   for the rationale (right 1/3).
3. **Score grid** — same `.score-grid` (and `.score-grid--canary-top`
   when the strategy has a canary bucket) with one placeholder row per
   asset. Row counts and bucket count are derived from
   `strategy.defaultUniverse` so the skeleton matches the real shape
   (VAA: 4+3 rows; DAA: 2 canary + 12 risky + 3 cash; etc.). Each row
   is a short block (ticker slot) plus a longer block (score + dot bar
   slot). Each bucket gets a small header block where the bucket label
   normally sits.

### Placeholder block styling (in `web/src/index.css`)

- Solid `var(--ink)` rectangles at ~10–12% opacity. Sharp corners —
  no border-radius, no gradients, no shadows (per DESIGN.md).
- Pulse animation: `@keyframes` cycling block opacity roughly
  0.5 ↔ 1.0 over ~1.2s, ease-in-out, infinite.
- `@media (prefers-reduced-motion: reduce)` disables the animation
  (blocks render static).

### `DecisionTool` render logic change

Current: skeleton text only when `loading && !decision && !error`;
stale `DecisionCard` stays visible during refetch.

New:

- `loading` → `<DecisionSkeleton strategy={strategy} />` (regardless of
  stale error/decision state — e.g. a PAA refetch after a failed request
  still shows the skeleton, since `error` isn't cleared until success)
- `!loading && error` → existing `.error-box`
- `!loading && decision` → `<DecisionCard />`

This covers both first load and PAA protection-factor refetch. The
`Fetching decision…` line is removed. Fetch/state logic in
`DecisionTool` and the API client are unchanged.

## Out of scope

- Home card restyle, mobile typography, whitespace rebalancing (noted
  as separate candidates during review; not part of this change).
- Backend/API changes, request caching, latency reduction.
- Staged status messages or progress reporting.

## Verification

No JS test infra exists in `web/` and none is added for this. Verify
with the browse tool against a local dev server:

1. Load each of the 6 strategy pages; screenshot during fetch —
   skeleton visible, shaped per strategy (bucket/row counts correct).
2. Screenshot after load — real content aligns with skeleton footprint
   (no large layout jump).
3. On PAA, toggle protection factor — skeleton replaces the previous
   result during refetch.
4. Kill the backend / point at a dead API — error box renders, no
   skeleton stuck on screen.

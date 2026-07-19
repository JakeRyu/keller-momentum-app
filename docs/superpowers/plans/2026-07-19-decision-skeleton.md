# Decision Skeleton Loading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the tiny `Fetching decision…` line on StrategyPage with a pulsing skeleton layout that mirrors the decision spread, shown during every fetch (initial load and PAA refetch).

**Architecture:** One new presentational component (`DecisionSkeleton`) renders gray placeholder blocks shaped per strategy (bucket/row counts derived client-side from `strategy.defaultUniverse`). `DecisionTool` swaps its render branches so `loading` always shows the skeleton. All styling goes in `index.css` following the existing Brutalist Quarterly tokens.

**Tech Stack:** React 19 + TypeScript (Vite), plain CSS. No new dependencies. No JS test infra exists in `web/` and none is added — verification is `npm run lint`, `npm run build`, and browse-tool screenshots.

**Spec:** `docs/superpowers/specs/2026-07-19-decision-skeleton-design.md`

## Global Constraints

- Design system (DESIGN.md): colors `--bg #f5f1e8` / `--ink #0a0a0a` / `--red #e63946` only; **no gradients, no drop shadows, no border-radius**.
- Placeholder blocks: solid `var(--ink)` at ~10–12% opacity; animate opacity only (~0.5 ↔ 1.0, ~1.2s, ease-in-out, infinite).
- `@media (prefers-reduced-motion: reduce)` must disable the animation.
- The only real text in the skeleton is the mono caption `FETCHING LIVE MARKET DATA…`.
- No changes to `web/src/api/decisions.ts`, `DecisionCard`, or any backend code.
- All commands below run from `web/`.

---

### Task 1: DecisionSkeleton component + CSS

**Files:**
- Create: `web/src/components/DecisionSkeleton.tsx`
- Modify: `web/src/index.css` (append a new section after the `/* Score grid wrapper */` block that ends at the `@media (max-width: 720px)` rule around line 612; before the `/* PAA protection-level segmented control */` comment at ~line 614)

**Interfaces:**
- Consumes: `Strategy`, `StrategyKind` types from `web/src/strategies.ts` (already exist).
- Produces: `export default function DecisionSkeleton({ strategy }: { strategy: Strategy })` — Task 2 imports this.

- [ ] **Step 1: Write the component**

Create `web/src/components/DecisionSkeleton.tsx`:

```tsx
import type { Strategy, StrategyKind } from '../strategies'

/**
 * Pure-placeholder skeleton mirroring DecisionCard's layout. Bucket and
 * row counts are derived from the strategy's universe so the skeleton
 * matches the shape of the eventual result (VAA: 4+3 rows, DAA: 2+12+3,
 * LAA: one 2-row macro-signal bucket, …). No real tickers or labels —
 * the only text is the fetching caption.
 */

type SkeletonBucket = { area?: 'canary' | 'risky' | 'cash'; rows: number }

function skeletonBuckets(u: StrategyKind): SkeletonBucket[] {
  switch (u.kind) {
    case 'vaa':
      return [{ rows: u.offensive.length }, { rows: u.defensive.length }]
    case 'daa':
    case 'baa':
      return [
        { area: 'canary', rows: u.canary.length },
        { area: 'risky', rows: u.risky.length },
        { area: 'cash', rows: u.cash.length },
      ]
    case 'paa':
      return [{ rows: u.risky.length }, { rows: u.cash.length }]
    case 'haa':
      return [
        { area: 'canary', rows: 1 },
        { area: 'risky', rows: u.risky.length },
        { area: 'cash', rows: 1 },
      ]
    case 'laa':
      // LAA renders a single "Macro Signals" bucket: SPY trend + UNRATE.
      return [{ rows: 2 }]
  }
}

export default function DecisionSkeleton({ strategy }: { strategy: Strategy }) {
  const buckets = skeletonBuckets(strategy.defaultUniverse)
  const hasCanary = buckets.some((b) => b.area === 'canary')

  const renderBucket = (bucket: SkeletonBucket, i: number) => (
    <div
      key={i}
      className={
        bucket.area ? `score-cell score-cell--${bucket.area}` : undefined
      }
    >
      <div className="skeleton__block skeleton__bucket-title" />
      {Array.from({ length: bucket.rows }, (_, r) => (
        <div key={r} className="skeleton__row">
          <div className="skeleton__block skeleton__ticker" />
          <div className="skeleton__block skeleton__score" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="skeleton" aria-hidden="true">
      <span className="skeleton__caption">Fetching live market data…</span>

      <div className="decision-spread">
        <div>
          <div className="skeleton__block skeleton__hero" />
          <div className="skeleton__block skeleton__weight" />
        </div>
        <div className="skeleton__rationale">
          <div className="skeleton__block skeleton__line" />
          <div className="skeleton__block skeleton__line" />
          <div className="skeleton__block skeleton__line" />
          <div className="skeleton__block skeleton__line skeleton__line--short" />
        </div>
      </div>

      <div
        className={
          hasCanary ? 'score-grid score-grid--canary-top' : 'score-grid'
        }
      >
        {buckets.map(renderBucket)}
      </div>
    </div>
  )
}
```

Note: the caption is lowercase in JSX; CSS applies `text-transform: uppercase` (matches how `.decision__mode` renders `State · …`).

- [ ] **Step 2: Append skeleton CSS**

In `web/src/index.css`, insert after the closing brace of the `@media (max-width: 720px)` block that resets `.score-cell--*` grid areas (directly before the `/* PAA protection-level segmented control` comment):

```css
/* Decision skeleton — placeholder blocks while a decision is fetched.
   Solid ink at low opacity, sharp corners, opacity pulse only (no
   gradients/shadows per DESIGN.md). */

.skeleton__caption {
  display: inline-block;
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0 0 16px;
  padding: 4px 0;
}

.skeleton__block {
  background: var(--ink);
  opacity: 0.11;
  animation: skeleton-pulse 1.2s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.06;
  }
  50% {
    opacity: 0.13;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton__block {
    animation: none;
  }
}

.skeleton__hero {
  height: clamp(102px, 15.3vw, 187px);
  max-width: 480px;
}
.skeleton__weight {
  height: 20px;
  max-width: 300px;
  margin: 12px 0 16px;
}

.skeleton__rationale {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 24px;
}
.skeleton__line {
  height: 14px;
}
.skeleton__line--short {
  width: 60%;
}

.skeleton__bucket-title {
  height: 12px;
  max-width: 140px;
  margin: 0 0 14px;
}
.skeleton__row {
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 12px;
  padding: 8px 0;
}
.skeleton__ticker {
  height: 14px;
}
.skeleton__score {
  height: 14px;
  max-width: 260px;
}
```

(`.skeleton__hero` height ≈ 0.85 line-height × the `clamp(120px, 18vw, 220px)` hero ticker font so the loaded state lands near the skeleton footprint.)

- [ ] **Step 3: Lint and typecheck**

Run: `npm run lint && npm run build`
Expected: both pass. `DecisionSkeleton` is not imported anywhere yet — if lint flags the unused export, that's fine (exports aren't flagged); do NOT wire it in yet.

- [ ] **Step 4: Commit**

```bash
git add src/components/DecisionSkeleton.tsx src/index.css
git commit -m "feat(web): add DecisionSkeleton placeholder component"
```

---

### Task 2: Wire skeleton into DecisionTool

**Files:**
- Modify: `web/src/components/DecisionTool.tsx:45-57` (the render block of `DecisionTool`)

**Interfaces:**
- Consumes: `DecisionSkeleton` default export from Task 1.
- Produces: no new exports; render behavior contract: `loading` → skeleton, `!loading && error` → error box, `!loading && decision` → card.

- [ ] **Step 1: Update imports and render logic**

In `web/src/components/DecisionTool.tsx`, add the import (with the other component imports):

```tsx
import DecisionSkeleton from './DecisionSkeleton'
```

Replace the render block:

```tsx
  return (
    <div className="decision">
      {isPaa && <PaaProtectionPicker value={paaA} onChange={setPaaA} />}

      {loading && !decision && !error && (
        <p className="muted">Fetching decision…</p>
      )}

      {error && <pre className="error-box">{error}</pre>}

      {decision && <DecisionCard decision={decision} />}
    </div>
  )
```

with:

```tsx
  return (
    <div className="decision">
      {isPaa && <PaaProtectionPicker value={paaA} onChange={setPaaA} />}

      {loading && <DecisionSkeleton strategy={strategy} />}

      {!loading && error && <pre className="error-box">{error}</pre>}

      {!loading && !error && decision && <DecisionCard decision={decision} />}
    </div>
  )
```

Semantics change (intended, per spec): during any fetch — including PAA protection-factor refetch and retry-after-error — only the skeleton shows; stale decisions and stale errors are hidden until the request settles.

- [ ] **Step 2: Lint and typecheck**

Run: `npm run lint && npm run build`
Expected: both pass, no unused-variable warnings (the `muted` line is gone but `.muted` CSS stays — it's used elsewhere).

- [ ] **Step 3: Commit**

```bash
git add src/components/DecisionTool.tsx
git commit -m "feat(web): show decision skeleton during every fetch"
```

---

### Task 3: Visual verification (browse)

**Files:** none modified — verification only. Uses the browse tool (`~/.claude/skills/gstack/browse/dist/browse`).

**Interfaces:**
- Consumes: running dev server + skeleton behavior from Tasks 1–2.

- [ ] **Step 1: Start dev server against the production API**

```bash
VITE_API_BASE_URL=https://momentum-api.bravehill-06823086.uksouth.azurecontainerapps.io npm run dev
```

(run in background; note the port, default `http://localhost:5173`)

- [ ] **Step 2: Capture loading + loaded screenshots for all 6 strategies**

For each of `vaa daa paa haa baa laa`: `goto http://localhost:5173/strategies/<id>`, screenshot immediately (loading state), wait ~10s, screenshot again (loaded state). Read each PNG.

Expected loading state: caption `FETCHING LIVE MARKET DATA…`, pulsing gray blocks, bucket/row counts per strategy — VAA 4+3 (two columns), DAA 2+12+3 (canary top-left), PAA 12+3, HAA 1+8+1 (canary top-left), BAA 3+12+5 (canary top-left), LAA one 2-row bucket. No layout overflow, footer sits below the skeleton (page not collapsed).

Expected loaded state: real decision renders; overall section footprint close to the skeleton (no jarring jump).

- [ ] **Step 3: Verify PAA refetch shows skeleton**

On `/strategies/paa` after load, click a different protection segment (a=0 or a=1), screenshot immediately. Expected: skeleton replaces the previous result; after ~10s the new decision renders.

- [ ] **Step 4: Verify error path**

Restart dev server with a dead API: `VITE_API_BASE_URL=http://localhost:9 npm run dev`. Load `/strategies/vaa`, wait for the request to fail, screenshot. Expected: error box renders, skeleton gone (not stuck).

- [ ] **Step 5: Mobile spot-check**

Viewport 375x812, `goto /strategies/daa` (deepest grid), screenshot during load. Expected: buckets stack single-column in DOM order, no horizontal overflow.

- [ ] **Step 6: Report**

Present before/after screenshots to the user. No commit (no file changes).

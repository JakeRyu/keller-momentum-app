# Web → App Funnel, Phase A — Design

Date: 2026-07-19
Scope: `web/` only. Repositions the web app as the education/marketing
funnel for the iPhone app, before the app is live on the App Store.

## Background

The web tool runs Keller's original US-ETF universe at today's date
only — not actionable for non-US residents. The mobile app already
solves both limits: per-asset-class UK UCITS mapping
(`mobile/src/etfCatalog.ts`) and an `asOf` date picker. Positioning
going forward: **web = education + marketing funnel; mobile = the
usable tool.**

The app is not yet on the App Store (build/listing/submit pending), so
Phase A ships the funnel structure with a `COMING SOON TO THE APP
STORE` marker instead of a link. Phase B (separate, post-launch) swaps
in the real App Store badge/URL and an `apple-itunes-app` Smart App
Banner meta tag.

## Changes

### 1. New component: `web/src/components/AppPromo.tsx`

Reusable promo box, Brutalist Quarterly styling (1px ink border, sharp
corners, cream background — no fills, gradients, shadows, radius).

Content (all English, matching site copy):

- Mono micro-caps header: `US UNIVERSE · TODAY ONLY`
- Body (serif): "This tool runs Keller's original US-ETF universe at
  today's date. The Momentum Investment iPhone app maps every asset
  class to local UCITS alternatives (UK first) and runs any date you
  choose."
- Marker (mono caps, muted, non-interactive): `COMING SOON TO THE APP
  STORE`

### 2. StrategyPage placement

`AppPromo` renders on every strategy page below the decision tool
(after the score grid / error box, above the `← All strategies` back
link). It shows regardless of decision load state — it is static
content, not tied to the fetch.

### 3. Home app section

New section on `Home` below the strategy grid, separated by a heavy
5px rule (same treatment as `strategies-section`). Contents:

- Section header (mono caps, ink): `TAKE IT WITH YOU`
- Two-column comparison (stacks on ≤720px), each column headed by a
  mono micro-caps label:
  - `THIS SITE` — US paper universe · Today's decision only ·
    Strategy education
  - `THE APP` — Local UCITS ETF mapping (UK first) · Any decision
    date · The same six strategies
- The `COMING SOON TO THE APP STORE` marker beneath (reuses the same
  styling as AppPromo's marker; implementation may reuse the component
  or share a CSS class — implementer's choice, no duplicated copy
  strings requirement).

### 4. About copy fix

`web/src/routes/About.tsx` currently ends the "How the strategies
work" section with:

> All strategies use the original Keller US ticker universe. The
> companion mobile app supports a UK UCITS substitution layer; web
> will follow.

Replace the second sentence — web will NOT follow. New copy:

> All strategies use the original Keller US ticker universe. The
> companion iPhone app adds a UK UCITS substitution layer and per-date
> decisions; the web tool intentionally stays with the original US
> paper universe as an educational preview.

### 5. Unchanged

- Hero tagline on Home stays as-is.
- No backend, mobile, or API changes.
- No App Store URL, badge asset, or `apple-itunes-app` meta tag —
  Phase B.

## Out of scope

- Phase B (real App Store link/badge, Smart App Banner) — blocked on
  app launch.
- Home card live-decision restyle (separate backlog item).
- Mobile "Learn more" back-link to web (declined for now).

## Verification

No JS test infra in `web/`; verify with `npm run lint`, `npm run
build`, and browse screenshots:

1. Strategy page (desktop + 375px): promo box renders below the score
   grid, styling matches the design system, no layout overflow.
2. Home (desktop + 375px): new section under the grid, two columns on
   desktop, stacked on mobile.
3. About: updated sentence renders.
4. Error state on a strategy page: promo box still renders below the
   error box.

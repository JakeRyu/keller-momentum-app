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

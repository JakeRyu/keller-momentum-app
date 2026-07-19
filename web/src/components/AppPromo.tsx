/**
 * Web-to-app funnel notice. The web tool intentionally stays on the US
 * paper universe at today's date; local-ticker mapping and per-date
 * decisions live in the iPhone app. The CTA is a static "coming soon"
 * marker until the app ships on the App Store (Phase B swaps in the
 * real badge + link).
 */
export default function AppPromo() {
  return (
    <aside className="app-promo">
      <p className="app-promo__tag">US Universe · Today Only</p>
      <p className="app-promo__body">
        This tool runs Keller's original US-ETF universe at today's date. The
        Momentum Investment iPhone app maps every asset class to local UCITS
        alternatives (UK first) and runs any date you choose.
      </p>
      <span className="app-promo__cta">Coming soon to the App Store</span>
    </aside>
  )
}

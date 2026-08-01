import { useEffect, useState } from 'react'
import { LayoutDashboard, ListChecks, ShipWheel, LogOut, Package } from 'lucide-react'
import Splash from './Splash'
import Login from './Login'
import Dashboard from './Dashboard'
import Summary from './Summary'
import SpareParts from './SpareParts'
import { claimsData, lastUpdated } from './claimsData'
import { spareData } from './spareData'
import { usePwaUpdates, UpdateBanner, OfflinePill, RefreshCheckButton } from './UpdateBanner'

const ALLOWED_DOMAIN = '@meinschiffrelax.com'
const STORAGE_KEY = 'msrClaimSummaryEmail'

export default function App() {
  const [email, setEmail] = useState(null)
  const [checked, setChecked] = useState(false)
  const [tab, setTab] = useState('dashboard')
  const [showSplash, setShowSplash] = useState(true)
  const [splashFadingOut, setSplashFadingOut] = useState(false)
  const { needRefresh, offlineReady, isOffline, checking, checkForUpdates, applyUpdate, dismissOfflineReady } = usePwaUpdates()

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && stored.endsWith(ALLOWED_DOMAIN)) setEmail(stored)
    setChecked(true)
  }, [])

  // Show the splash for a short minimum time so it reads as an intentional
  // loading screen rather than a flash, then fade it out — only on first load.
  useEffect(() => {
    if (!checked) return
    const holdTimer = setTimeout(() => {
      setSplashFadingOut(true)
      setTimeout(() => setShowSplash(false), 500)
    }, 900)
    return () => clearTimeout(holdTimer)
  }, [checked])

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY)
    setEmail(null)
  }

  if (!checked) return <Splash fadingOut={false} />

  if (!email) {
    return (
      <>
        {showSplash && <Splash fadingOut={splashFadingOut} />}
        <Login onSuccess={setEmail} />
        <UpdateBanner
          needRefresh={needRefresh}
          offlineReady={offlineReady}
          onApplyUpdate={applyUpdate}
          onDismissOfflineReady={dismissOfflineReady}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-ink font-body">
      {showSplash && <Splash fadingOut={splashFadingOut} />}
      <header
        className="sticky top-0 z-10 bg-ink/95 backdrop-blur border-b border-white/10"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange/10 border border-orange/30 flex items-center justify-center shrink-0">
              <ShipWheel className="w-5 h-5 text-orange" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="font-display text-lg text-white leading-tight">MSR Claim Summary</h1>
              <p className="text-white/35 text-[11px]">Updated {lastUpdated}</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 bg-panel border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                tab === 'dashboard' ? 'bg-orange text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={() => setTab('summary')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                tab === 'summary' ? 'bg-orange text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Summary</span>
            </button>
            <button
              onClick={() => setTab('spareparts')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                tab === 'spareparts' ? 'bg-orange text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Spare Parts</span>
            </button>
          </nav>

          <div className="flex items-center gap-1 shrink-0">
            <OfflinePill isOffline={isOffline} />
            <RefreshCheckButton checking={checking} onCheck={checkForUpdates} />
            <button
              onClick={handleLogout}
              title="Sign out"
              className="text-white/30 hover:text-white/70 transition-colors p-2"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {tab === 'dashboard' && <Dashboard claims={claimsData} />}
        {tab === 'summary' && <Summary claims={claimsData} spareParts={spareData} />}
        {tab === 'spareparts' && <SpareParts parts={spareData} />}
      </main>

      <footer className="max-w-7xl mx-auto px-4 md:px-6 py-6 text-center text-white/20 text-xs">
        Data refreshed weekly by Guarantee Engineer
      </footer>

      <UpdateBanner
        needRefresh={needRefresh}
        offlineReady={offlineReady}
        onApplyUpdate={applyUpdate}
        onDismissOfflineReady={dismissOfflineReady}
      />
    </div>
  )
}

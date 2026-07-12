import { useEffect, useState } from 'react'
import { LayoutDashboard, ListChecks, ShipWheel, LogOut } from 'lucide-react'
import Login from './Login'
import Dashboard from './Dashboard'
import Summary from './Summary'
import { claimsData, lastUpdated } from './claimsData'

const ALLOWED_DOMAIN = '@meinschiffrelax.com'
const STORAGE_KEY = 'msrClaimSummaryEmail'

export default function App() {
  const [email, setEmail] = useState(null)
  const [checked, setChecked] = useState(false)
  const [tab, setTab] = useState('dashboard')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && stored.endsWith(ALLOWED_DOMAIN)) setEmail(stored)
    setChecked(true)
  }, [])

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY)
    setEmail(null)
  }

  if (!checked) return null

  if (!email) {
    return <Login onSuccess={setEmail} />
  }

  return (
    <div className="min-h-screen bg-ink font-body">
      <header className="sticky top-0 z-10 bg-ink/95 backdrop-blur border-b border-white/10">
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
          </nav>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-white/30 hover:text-white/70 transition-colors p-2"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {tab === 'dashboard' ? <Dashboard claims={claimsData} /> : <Summary claims={claimsData} />}
      </main>

      <footer className="max-w-7xl mx-auto px-4 md:px-6 py-6 text-center text-white/20 text-xs">
        Data refreshed weekly by Guarantee Engineer
      </footer>
    </div>
  )
}

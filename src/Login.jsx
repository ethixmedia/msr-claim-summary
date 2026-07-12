import { useState } from 'react'
import { ShipWheel, AlertCircle } from 'lucide-react'

const ALLOWED_DOMAIN = '@meinschiffrelax.com'

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  function handleSubmit() {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (!trimmed.endsWith(ALLOWED_DOMAIN)) {
      setError('This site is for Mein Schiff Relax crew only.')
      return
    }
    localStorage.setItem('msrClaimSummaryEmail', trimmed)
    onSuccess(trimmed)
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-orange/10 border border-orange/30 flex items-center justify-center mb-4">
            <ShipWheel className="w-7 h-7 text-orange" strokeWidth={1.75} />
          </div>
          <h1 className="font-display text-2xl text-white text-center">MSR Claim Summary</h1>
          <p className="text-sm text-white/40 mt-1 text-center">Guarantee claim overview for crew</p>
        </div>

        <div className="bg-panel border border-white/10 rounded-2xl p-6">
          <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wide">
            Crew email
          </label>
          <input
            type="text"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError('')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit()
            }}
            placeholder="yourname@meinschiffrelax.com"
            autoFocus
            className="w-full bg-ink border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-orange/60 transition-colors"
          />

          {error && (
            <div className="flex items-start gap-2 mt-3 text-red text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full mt-5 bg-orange hover:bg-orange/90 text-white font-medium text-sm rounded-lg py-3 transition-colors"
          >
            Continue
          </button>
        </div>

        <p className="text-center text-white/25 text-xs mt-6">
          View-only access &middot; data updated weekly
        </p>
      </div>
    </div>
  )
}

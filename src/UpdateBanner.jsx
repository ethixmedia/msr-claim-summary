import { useEffect, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, WifiOff, Download } from 'lucide-react'

// Handles: automatic offline caching, detecting a new deployed version,
// showing a "new data available" banner, and a manual refresh-check button.
export function usePwaUpdates() {
  const registrationRef = useRef(null)
  const [checking, setChecking] = useState(false)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      registrationRef.current = registration || null
    },
  })

  useEffect(() => {
    function goOnline() { setIsOffline(false) }
    function goOffline() { setIsOffline(true) }
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  // Manual "check for updates now" — pings the server for a new service
  // worker / new claimsData bundle without waiting for the periodic check.
  async function checkForUpdates() {
    if (!registrationRef.current || checking) return
    setChecking(true)
    try {
      await registrationRef.current.update()
    } catch (e) {
      // offline or request failed — silently ignore, banner state won't change
    } finally {
      setTimeout(() => setChecking(false), 800)
    }
  }

  function applyUpdate() {
    setNeedRefresh(false)
    updateServiceWorker(true)
  }

  function dismissOfflineReady() {
    setOfflineReady(false)
  }

  return { needRefresh, offlineReady, isOffline, checking, checkForUpdates, applyUpdate, dismissOfflineReady }
}

export function UpdateBanner({ needRefresh, offlineReady, onApplyUpdate, onDismissOfflineReady }) {
  if (needRefresh) {
    return (
      <div className="fixed left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-sm" style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
        <div className="bg-panel border border-orange/40 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange/15 border border-orange/30 flex items-center justify-center shrink-0">
            <Download className="w-4 h-4 text-orange" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium">New data available</p>
            <p className="text-white/40 text-xs">Tap to load the latest claim update</p>
          </div>
          <button
            onClick={onApplyUpdate}
            className="bg-orange hover:bg-orange/90 text-white text-xs font-medium rounded-lg px-3 py-2 shrink-0 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  if (offlineReady) {
    return (
      <div className="fixed left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-sm" style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
        <div className="bg-panel border border-teal/30 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal/15 border border-teal/30 flex items-center justify-center shrink-0">
            <Download className="w-4 h-4 text-teal" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium">Ready for offline use</p>
            <p className="text-white/40 text-xs">Claims are saved on this device</p>
          </div>
          <button
            onClick={onDismissOfflineReady}
            className="text-white/40 hover:text-white text-xs font-medium rounded-lg px-3 py-2 shrink-0 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    )
  }

  return null
}

export function OfflinePill({ isOffline }) {
  if (!isOffline) return null
  return (
    <div className="flex items-center gap-1.5 text-xs text-white/50 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
      <WifiOff className="w-3 h-3" />
      <span className="hidden sm:inline">Offline</span>
    </div>
  )
}

export function RefreshCheckButton({ checking, onCheck }) {
  return (
    <button
      onClick={onCheck}
      title="Check for updates"
      disabled={checking}
      className="text-white/30 hover:text-white/70 transition-colors p-2 disabled:opacity-40"
    >
      <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
    </button>
  )
}

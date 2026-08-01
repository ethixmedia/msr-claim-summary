import { ShipWheel } from 'lucide-react'

export default function Splash({ fadingOut }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink transition-opacity duration-500 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="w-16 h-16 rounded-2xl bg-orange/10 border border-orange/30 flex items-center justify-center mb-5">
        <ShipWheel className="w-8 h-8 text-orange animate-[spin_3s_linear_infinite]" strokeWidth={1.5} />
      </div>
      <h1 className="font-display text-2xl text-white">MSR Claim Summary</h1>
      <p className="text-white/35 text-xs mt-2 tracking-wide">MEIN SCHIFF RELAX</p>

      <div className="flex items-center gap-1.5 mt-8">
        <span className="w-1.5 h-1.5 rounded-full bg-orange animate-[pulse_1.2s_ease-in-out_infinite]" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-orange animate-[pulse_1.2s_ease-in-out_infinite]" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-orange animate-[pulse_1.2s_ease-in-out_infinite]" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

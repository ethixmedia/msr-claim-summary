import { useMemo, useState, useRef, useEffect } from 'react'
import { Search, X, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown, Package } from 'lucide-react'

const PAGE_SIZE = 30

function MultiSelect({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function toggle(opt) {
    if (selected.includes(opt)) onChange(selected.filter((s) => s !== opt))
    else onChange([...selected, opt])
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 border rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
          selected.length ? 'border-orange/50 bg-orange/10 text-orange' : 'border-white/10 bg-panel text-white/60 hover:border-white/25'
        }`}
      >
        {label}
        {selected.length > 0 && <span className="bg-orange/20 rounded px-1.5">{selected.length}</span>}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-56 max-h-72 overflow-y-auto bg-[#1A1A1A] border border-white/10 rounded-xl shadow-xl p-2">
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-xs text-white/80">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="accent-[#F04E23] w-3.5 h-3.5"
              />
              <span className="truncate">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="py-2.5 border-b border-white/5 last:border-0">
      <p className="text-white/35 text-[11px] uppercase tracking-wide mb-1">{label}</p>
      <p className="text-white/90 text-sm whitespace-pre-line break-words">{value || '—'}</p>
    </div>
  )
}

function Drawer({ item, onClose }) {
  if (!item) return null
  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#141414] border-l border-white/10 h-full overflow-y-auto">
        <div
          className="sticky top-0 bg-[#141414]/95 backdrop-blur border-b border-white/10 px-5 py-4 flex items-start justify-between"
          style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}
        >
          <div>
            <p className="text-orange text-xs font-medium">
              {item.gfrNumbers.length ? item.gfrNumbers.join(', ') : item.claimRef || 'No claim reference'}
            </p>
            <p className="text-white font-medium text-sm mt-1 pr-4">{item.desc}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 py-2" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
          <div className="flex items-center gap-2 py-3 border-b border-white/5">
            <span className="text-xs px-2 py-1 rounded-md border border-white/15 text-white/60">{item.dept}</span>
            {item.qty != null && (
              <span className="text-xs px-2 py-1 rounded-md border border-teal/30 bg-teal/10 text-teal">
                Qty: {item.qty} {item.unit}
              </span>
            )}
          </div>
          <DetailRow label="Linked GFR Claim(s)" value={item.gfrNumbers.length ? item.gfrNumbers.join(', ') : 'Not linked to a GFR number'} />
          <DetailRow label="Original Claim Reference" value={item.claimRef} />
          <DetailRow label="Description" value={item.desc} />
          <DetailRow label="Quantity" value={item.qty != null ? `${item.qty} ${item.unit}`.trim() : null} />
          <DetailRow label="Vendor" value={item.vendor} />
          <DetailRow label="Department" value={item.dept} />
          <DetailRow label="Location / Handover" value={item.location} />
          <DetailRow label="Tracking Reference" value={item.tracking} />
          <DetailRow label="Alt. Tracking Reference" value={item.trackingAlt} />
          <DetailRow label="Date Received" value={item.date} />
        </div>
      </div>
    </div>
  )
}

export default function SpareParts({ parts }) {
  const [query, setQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState([])
  const [vendorFilter, setVendorFilter] = useState([])
  const [sortKey, setSortKey] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  const depts = useMemo(() => [...new Set(parts.map((p) => p.dept))].sort(), [parts])
  const vendors = useMemo(() => [...new Set(parts.map((p) => p.vendor).filter(Boolean))].sort(), [parts])

  const filtered = useMemo(() => {
    let list = parts
    if (deptFilter.length) list = list.filter((p) => deptFilter.includes(p.dept))
    if (vendorFilter.length) list = list.filter((p) => vendorFilter.includes(p.vendor))
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.desc.toLowerCase().includes(q) ||
          p.claimRef.toLowerCase().includes(q) ||
          p.gfrNumbers.some((g) => g.toLowerCase().includes(q)) ||
          p.dept.toLowerCase().includes(q) ||
          (p.vendor && p.vendor.toLowerCase().includes(q))
      )
    }
    const sorted = [...list].sort((a, b) => {
      let av, bv
      if (sortKey === 'gfr') {
        av = a.gfrNumbers[0] || a.claimRef || ''
        bv = b.gfrNumbers[0] || b.claimRef || ''
      } else {
        av = (a[sortKey] || '').toString()
        bv = (b[sortKey] || '').toString()
      }
      const cmp = av.localeCompare(bv, undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [parts, deptFilter, vendorFilter, query, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageClamped = Math.min(page, totalPages)
  const pageItems = filtered.slice((pageClamped - 1) * PAGE_SIZE, pageClamped * PAGE_SIZE)

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const hasActiveFilters = deptFilter.length > 0 || vendorFilter.length > 0 || query.trim().length > 0

  function clearAll() {
    setDeptFilter([])
    setVendorFilter([])
    setQuery('')
    setPage(1)
  }

  const columns = [
    { key: 'gfr', label: 'GFR No.', width: 'w-[16%]' },
    { key: 'dept', label: 'Department', width: 'w-[16%]' },
    { key: 'desc', label: 'What Received', width: 'w-[42%]' },
    { key: 'date', label: 'Date', width: 'w-[12%]' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Search by GFR number, item, department, vendor…"
            className="w-full bg-panel border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-orange/50"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <MultiSelect label="Department" options={depts} selected={deptFilter} onChange={(v) => { setDeptFilter(v); setPage(1) }} />
          <MultiSelect label="Vendor" options={vendors} selected={vendorFilter} onChange={(v) => { setVendorFilter(v); setPage(1) }} />
          {hasActiveFilters && (
            <button onClick={clearAll} className="text-xs text-white/40 hover:text-white flex items-center gap-1 px-2">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-white/35 px-1">
        <span className="flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" />
          {filtered.length.toLocaleString()} of {parts.length.toLocaleString()} received items
        </span>
        <span>Page {pageClamped} of {totalPages}</span>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden bg-panel border border-white/10 rounded-2xl overflow-hidden">
        {pageItems.length === 0 && (
          <div className="px-4 py-12 text-center text-white/30 text-sm">No received items match your search or filters.</div>
        )}
        <div className="divide-y divide-white/5">
          {pageItems.map((p) => (
            <button
              key={p.rowId}
              onClick={() => setSelected(p)}
              className="w-full text-left px-4 py-4 active:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-orange text-xs font-semibold tracking-wide truncate">
                  {p.gfrNumbers.length ? p.gfrNumbers.join(', ') : p.claimRef || 'No claim ref'}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md border border-white/15 text-white/60 whitespace-nowrap shrink-0">
                  {p.dept}
                </span>
              </div>
              <p className="text-white text-base leading-snug font-medium mb-2">{p.desc || '—'}</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-white/40 text-xs truncate">
                  {p.date || ''}{p.qty != null ? ` · Qty ${p.qty} ${p.unit}` : ''}
                </span>
                <span className="text-orange/80 text-xs font-medium shrink-0">View more →</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: sortable table */}
      <div className="hidden md:block bg-panel border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className={`${col.width} text-left px-4 py-3 text-white/40 text-xs uppercase tracking-wide font-medium cursor-pointer select-none hover:text-white/70 whitespace-nowrap`}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      <ArrowUpDown className={`w-3 h-3 ${sortKey === col.key ? 'text-orange' : 'text-white/20'}`} />
                    </span>
                  </th>
                ))}
                <th className="w-[80px] px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {pageItems.map((p) => (
                <tr key={p.rowId} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3 text-orange font-medium whitespace-nowrap">
                    {p.gfrNumbers.length ? p.gfrNumbers.join(', ') : p.claimRef || '—'}
                  </td>
                  <td className="px-4 py-3 text-white/70 truncate max-w-0">{p.dept}</td>
                  <td className="px-4 py-3 text-white/85">
                    <span className="line-clamp-2">{p.desc || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-white/50 whitespace-nowrap">{p.date || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelected(p)}
                      className="text-xs text-white/50 hover:text-orange border border-white/15 hover:border-orange/50 rounded-lg px-2.5 py-1.5 transition-colors whitespace-nowrap"
                    >
                      View more
                    </button>
                  </td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-white/30 text-sm">
                    No received items match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-panel border border-white/10 rounded-2xl flex items-center justify-between px-4 py-3">
        <button
          disabled={pageClamped <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="flex items-center gap-1 text-xs text-white/50 hover:text-white disabled:opacity-25 disabled:hover:text-white/50 px-2 py-1"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <span className="text-xs text-white/30 text-center">
          {(pageClamped - 1) * PAGE_SIZE + 1}–{Math.min(pageClamped * PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString()}
        </span>
        <button
          disabled={pageClamped >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="flex items-center gap-1 text-xs text-white/50 hover:text-white disabled:opacity-25 disabled:hover:text-white/50 px-2 py-1"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <Drawer item={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

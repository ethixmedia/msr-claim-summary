import { useMemo, useState, useRef, useEffect } from 'react'
import { Search, X, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { statusBadgeClasses } from './statusStyles'

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

function Drawer({ claim, onClose }) {
  if (!claim) return null
  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#141414] border-l border-white/10 h-full overflow-y-auto animate-[slideIn_0.2s_ease-out]">
        <div className="sticky top-0 bg-[#141414]/95 backdrop-blur border-b border-white/10 px-5 py-4 flex items-start justify-between">
          <div>
            <p className="text-orange text-xs font-medium">{claim.id}</p>
            <p className="text-white font-medium text-sm mt-1 pr-4">{claim.title}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 py-2">
          <div className="flex items-center gap-2 py-3 border-b border-white/5">
            <span className={`text-xs px-2 py-1 rounded-md border ${statusBadgeClasses(claim.status)}`}>{claim.status}</span>
            <span className="text-xs px-2 py-1 rounded-md border border-white/15 text-white/60">{claim.priority} priority</span>
          </div>
          <DetailRow label="Ship Department" value={claim.dept} />
          <DetailRow label="GFR Description" value={claim.desc} />
          <DetailRow label="Supplier" value={claim.supplier} />
          <DetailRow label="System / Equipment" value={claim.system} />
          <DetailRow label="Opening Date" value={claim.openDate} />
          <DetailRow label="Closing Date" value={claim.closeDate} />
          <DetailRow label="Rejection Date" value={claim.rejectDate} />
          <DetailRow label="Deck" value={claim.deck} />
          <DetailRow label="MVZ (Fire Zone)" value={claim.mvz} />
        </div>
      </div>
    </div>
  )
}

export default function Summary({ claims }) {
  const [query, setQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState([])
  const [statusFilter, setStatusFilter] = useState([])
  const [systemFilter, setSystemFilter] = useState([])
  const [supplierFilter, setSupplierFilter] = useState([])
  const [sortKey, setSortKey] = useState('id')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  const depts = useMemo(() => [...new Set(claims.map((c) => c.dept))].sort(), [claims])
  const statuses = useMemo(() => [...new Set(claims.map((c) => c.status))].sort(), [claims])
  const systems = useMemo(() => [...new Set(claims.map((c) => c.system).filter(Boolean))].sort(), [claims])
  const suppliers = useMemo(() => [...new Set(claims.map((c) => c.supplier).filter(Boolean))].sort(), [claims])

  const filtered = useMemo(() => {
    let list = claims
    if (deptFilter.length) list = list.filter((c) => deptFilter.includes(c.dept))
    if (statusFilter.length) list = list.filter((c) => statusFilter.includes(c.status))
    if (systemFilter.length) list = list.filter((c) => systemFilter.includes(c.system))
    if (supplierFilter.length) list = list.filter((c) => supplierFilter.includes(c.supplier))
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.dept.toLowerCase().includes(q) ||
          (c.system && c.system.toLowerCase().includes(q)) ||
          (c.supplier && c.supplier.toLowerCase().includes(q))
      )
    }
    const sorted = [...list].sort((a, b) => {
      const av = (a[sortKey] || '').toString()
      const bv = (b[sortKey] || '').toString()
      const cmp = av.localeCompare(bv, undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [claims, deptFilter, statusFilter, systemFilter, supplierFilter, query, sortKey, sortDir])

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

  const hasActiveFilters =
    deptFilter.length > 0 || statusFilter.length > 0 || systemFilter.length > 0 || supplierFilter.length > 0 || query.trim().length > 0

  function clearAll() {
    setDeptFilter([])
    setStatusFilter([])
    setSystemFilter([])
    setSupplierFilter([])
    setQuery('')
    setPage(1)
  }

  const columns = [
    { key: 'dept', label: 'Ship Department', width: 'w-[16%]' },
    { key: 'id', label: 'GFR Number', width: 'w-[12%]' },
    { key: 'title', label: 'GFR Title', width: 'w-[42%]' },
    { key: 'status', label: 'Status', width: 'w-[15%]' },
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
            placeholder="Search by GFR number, title, department, system, supplier…"
            className="w-full bg-panel border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-orange/50"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <MultiSelect label="Department" options={depts} selected={deptFilter} onChange={(v) => { setDeptFilter(v); setPage(1) }} />
          <MultiSelect label="Status" options={statuses} selected={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1) }} />
          <MultiSelect label="System/Equipment" options={systems} selected={systemFilter} onChange={(v) => { setSystemFilter(v); setPage(1) }} />
          <MultiSelect label="Supplier" options={suppliers} selected={supplierFilter} onChange={(v) => { setSupplierFilter(v); setPage(1) }} />
          {hasActiveFilters && (
            <button onClick={clearAll} className="text-xs text-white/40 hover:text-white flex items-center gap-1 px-2">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-white/35 px-1">
        <span className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {filtered.length.toLocaleString()} of {claims.length.toLocaleString()} claims
        </span>
        <span>Page {pageClamped} of {totalPages}</span>
      </div>

      <div className="bg-panel border border-white/10 rounded-2xl overflow-hidden">
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
              {pageItems.map((c) => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3 text-white/70 truncate max-w-0">{c.dept}</td>
                  <td className="px-4 py-3 text-orange font-medium whitespace-nowrap">{c.id}</td>
                  <td className="px-4 py-3 text-white/85">
                    <span className="line-clamp-2">{c.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-md border whitespace-nowrap ${statusBadgeClasses(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelected(c)}
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
                    No claims match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
          <button
            disabled={pageClamped <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 text-xs text-white/50 hover:text-white disabled:opacity-25 disabled:hover:text-white/50 px-2 py-1"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-xs text-white/30">
            Showing {(pageClamped - 1) * PAGE_SIZE + 1}–{Math.min(pageClamped * PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString()}
          </span>
          <button
            disabled={pageClamped >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1 text-xs text-white/50 hover:text-white disabled:opacity-25 disabled:hover:text-white/50 px-2 py-1"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Drawer claim={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

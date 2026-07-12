import { useMemo } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, Legend,
} from 'recharts'
import { ClipboardList, CheckCircle2, XCircle, Search, Clock } from 'lucide-react'
import { statusColor, priorityColor, STATUS_ORDER, PRIORITY_ORDER, isOpenStatus } from './statusStyles'

function KpiCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="bg-panel border border-white/10 rounded-2xl p-5 flex items-center justify-between">
      <div>
        <p className="text-white/40 text-xs uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-semibold text-white">{value.toLocaleString()}</p>
      </div>
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accent}1A`, border: `1px solid ${accent}4D` }}
      >
        <Icon className="w-5 h-5" style={{ color: accent }} strokeWidth={1.75} />
      </div>
    </div>
  )
}

function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`bg-panel border border-white/10 rounded-2xl p-5 ${className}`}>
      <p className="text-white text-sm font-medium">{title}</p>
      {subtitle && <p className="text-white/35 text-xs mt-0.5">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="bg-[#0E0E0E] border border-white/15 rounded-lg px-3 py-2 text-xs">
      {label && <p className="text-white/50 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>
          {p.name}: <span className="text-white font-medium">{p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  )
}

export default function Dashboard({ claims }) {
  const stats = useMemo(() => {
    const total = claims.length
    let closed = 0, rejected = 0, open = 0, investigation = 0
    const statusCounts = {}
    const deptCounts = {}
    const priorityCounts = {}
    const deckCounts = {}
    const systemCounts = {}
    const monthCounts = {}

    for (const c of claims) {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1
      deptCounts[c.dept] = (deptCounts[c.dept] || 0) + 1
      priorityCounts[c.priority] = (priorityCounts[c.priority] || 0) + 1
      if (c.deck) deckCounts[c.deck] = (deckCounts[c.deck] || 0) + 1
      if (c.system) systemCounts[c.system] = (systemCounts[c.system] || 0) + 1

      if (c.status === 'Closed') closed++
      else if (c.status === 'Rejected') rejected++
      else if (c.status === 'Under Investigation') investigation++
      else open++

      if (c.openDate) {
        const month = c.openDate.slice(0, 7)
        monthCounts[month] = monthCounts[month] || { opened: 0, closed: 0 }
        monthCounts[month].opened++
      }
      if (c.closeDate) {
        const month = c.closeDate.slice(0, 7)
        monthCounts[month] = monthCounts[month] || { opened: 0, closed: 0 }
        monthCounts[month].closed++
      }
    }

    const statusData = STATUS_ORDER
      .filter((s) => statusCounts[s])
      .map((s) => ({ name: s, value: statusCounts[s], fill: statusColor(s) }))

    const deptData = Object.entries(deptCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }))

    const priorityData = PRIORITY_ORDER
      .filter((p) => priorityCounts[p])
      .map((name) => ({ name, value: priorityCounts[name], fill: priorityColor(name) }))

    const deckData = Object.entries(deckCounts)
      .sort((a, b) => {
        const na = parseInt(a[0], 10), nb = parseInt(b[0], 10)
        if (!isNaN(na) && !isNaN(nb)) return na - nb
        return a[0].localeCompare(b[0])
      })
      .map(([name, value]) => ({ name: `Dk ${name}`, value }))

    const topSystems = Object.entries(systemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name: name.length > 26 ? name.slice(0, 24) + '…' : name, value }))

    const monthlyTrend = Object.entries(monthCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, v]) => ({ month, Opened: v.opened, Closed: v.closed }))

    const closedWithDates = claims.filter((c) => c.status === 'Closed' && c.openDate && c.closeDate)
    let avgDays = 0
    if (closedWithDates.length) {
      const totalDays = closedWithDates.reduce((sum, c) => {
        const d = (new Date(c.closeDate) - new Date(c.openDate)) / (1000 * 60 * 60 * 24)
        return sum + Math.max(d, 0)
      }, 0)
      avgDays = Math.round(totalDays / closedWithDates.length)
    }

    return {
      total, closed, rejected, open, investigation,
      statusData, deptData, priorityData, deckData, topSystems, monthlyTrend, avgDays,
    }
  }, [claims])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiCard label="Total Claims" value={stats.total} icon={ClipboardList} accent="#F04E23" />
        <KpiCard label="Open" value={stats.open} icon={Search} accent="#F5C518" />
        <KpiCard label="Under Investigation" value={stats.investigation} icon={Clock} accent="#F04E23" />
        <KpiCard label="Closed" value={stats.closed} icon={CheckCircle2} accent="#00B4A6" />
        <KpiCard label="Rejected" value={stats.rejected} icon={XCircle} accent="#E24B4A" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard title="Status Breakdown" subtitle="All claims by current status">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {stats.statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} stroke="#1A1A1A" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">
            {stats.statusData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-white/60">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.fill }} />
                <span className="truncate">{s.name}</span>
                <span className="text-white/35 ml-auto">{s.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Priority Breakdown" subtitle="Owner-assigned priority">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.priorityData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {stats.priorityData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} stroke="#1A1A1A" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">
            {stats.priorityData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-white/60">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.fill }} />
                <span className="truncate">{s.name}</span>
                <span className="text-white/35 ml-auto">{s.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Avg. Days to Close" subtitle="Closed claims with both dates recorded">
          <div className="h-[220px] flex flex-col items-center justify-center">
            <p className="font-display text-6xl text-orange">{stats.avgDays}</p>
            <p className="text-white/40 text-sm mt-2">days on average</p>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Claims by Department" subtitle="Total claims per ship department">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stats.deptData} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
            <XAxis type="number" stroke="#666" fontSize={11} />
            <YAxis type="category" dataKey="name" stroke="#999" fontSize={11} width={140} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="value" fill="#F04E23" radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Monthly Opened vs Closed" subtitle="Trend by month">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={stats.monthlyTrend} margin={{ left: -16, right: 8 }}>
              <defs>
                <linearGradient id="openedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F04E23" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#F04E23" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="closedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00B4A6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#00B4A6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
              <XAxis dataKey="month" stroke="#666" fontSize={10} />
              <YAxis stroke="#666" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="Opened" stroke="#F04E23" fill="url(#openedGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="Closed" stroke="#00B4A6" fill="url(#closedGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Deck Hot Zones" subtitle="Claims count by deck">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.deckData} margin={{ left: -16, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
              <XAxis dataKey="name" stroke="#666" fontSize={10} />
              <YAxis stroke="#666" fontSize={11} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="value" fill="#7B4FD4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Top Recurring Systems / Equipment" subtitle="Most frequently claimed systems">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stats.topSystems} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
            <XAxis type="number" stroke="#666" fontSize={11} />
            <YAxis type="category" dataKey="name" stroke="#999" fontSize={11} width={180} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="value" fill="#F5C518" radius={[0, 4, 4, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

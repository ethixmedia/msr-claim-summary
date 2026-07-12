// Central place for status/priority color mapping, matching brand palette.

export const STATUS_COLORS = {
  'Closed': '#00B4A6',
  'Rejected': '#E24B4A',
  'Open Service': '#F5C518',
  'Open Spare': '#F5C518',
  'Open Documentation': '#F5C518',
  'Under Investigation': '#F04E23',
  'Recorded': '#7B4FD4',
}

export const STATUS_ORDER = [
  'Open Service',
  'Open Spare',
  'Open Documentation',
  'Under Investigation',
  'Recorded',
  'Rejected',
  'Closed',
]

export const PRIORITY_COLORS = {
  Top: '#7B4FD4',
  High: '#E24B4A',
  Medium: '#F5C518',
  Low: '#00B4A6',
}

export const PRIORITY_ORDER = ['Top', 'High', 'Medium', 'Low']

export function statusColor(status) {
  return STATUS_COLORS[status] || '#8A8A8A'
}

export function priorityColor(priority) {
  return PRIORITY_COLORS[priority] || '#8A8A8A'
}

export function statusBadgeClasses(status) {
  const map = {
    'Closed': 'bg-teal/15 text-teal border-teal/30',
    'Rejected': 'bg-red/15 text-red border-red/30',
    'Open Service': 'bg-yellow/15 text-yellow border-yellow/30',
    'Open Spare': 'bg-yellow/15 text-yellow border-yellow/30',
    'Open Documentation': 'bg-yellow/15 text-yellow border-yellow/30',
    'Under Investigation': 'bg-orange/15 text-orange border-orange/30',
    'Recorded': 'bg-purple/15 text-purple border-purple/30',
  }
  return map[status] || 'bg-white/10 text-white/60 border-white/20'
}

export function priorityBadgeClasses(priority) {
  const map = {
    Top: 'bg-purple/15 text-purple border-purple/30',
    High: 'bg-red/15 text-red border-red/30',
    Medium: 'bg-yellow/15 text-yellow border-yellow/30',
    Low: 'bg-teal/15 text-teal border-teal/30',
  }
  return map[priority] || 'bg-white/10 text-white/60 border-white/20'
}

export function isOpenStatus(status) {
  return status !== 'Closed' && status !== 'Rejected'
}

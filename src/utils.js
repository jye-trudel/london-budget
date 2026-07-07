export function getCurrentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function getLocalDate() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function prevMonth(m) {
  const [y, mo] = m.split('-').map(Number)
  const d = new Date(y, mo - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function nextMonth(m) {
  const [y, mo] = m.split('-').map(Number)
  const d = new Date(y, mo, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function formatMonth(m) {
  const [y, mo] = m.split('-').map(Number)
  return new Date(y, mo - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export function formatShortDate(dateStr) {
  // dateStr is YYYY-MM-DD; parse in local time to avoid off-by-one
  const [y, mo, d] = dateStr.split('-').map(Number)
  return new Date(y, mo - 1, d).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function daysLeftInMonth() {
  const today = new Date()
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  return Math.max(1, end.getDate() - today.getDate() + 1)
}

export function daysInMonth(m) {
  const [y, mo] = m.split('-').map(Number)
  return new Date(y, mo, 0).getDate()
}

export function fmt(n) {
  return `£${Number(n).toFixed(2)}`
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

// green → amber → orange → red based on spend percentage
export function barColor(pct) {
  if (pct >= 1) return '#dc2626'
  if (pct >= 0.9) return '#ea580c'
  if (pct >= 0.7) return '#d97706'
  return '#16a34a'
}

export function toCSV(expenses) {
  const header = 'Date,Category,Amount (£),Note'
  const rows = [...expenses]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(e =>
      [
        e.date,
        `"${e.category.replace(/"/g, '""')}"`,
        e.amount.toFixed(2),
        `"${(e.note || '').replace(/"/g, '""')}"`,
      ].join(',')
    )
  return [header, ...rows].join('\n')
}

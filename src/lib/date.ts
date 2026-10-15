/** Local-calendar day identifier, e.g. "2026-10-15". */
export function dayKey(ts: number) {
  const d = new Date(ts)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

function startOfDay(ts: number) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** Whole calendar days between `ts` and today (0 = today). */
function daysAgo(ts: number) {
  return Math.round((startOfDay(Date.now()) - startOfDay(ts)) / 86_400_000)
}

export function isToday(ts: number) {
  return daysAgo(ts) === 0
}

/** Calendar day `offset` days from today, e.g. addDaysKey(1) is tomorrow. */
export function addDaysKey(offset: number) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return dayKey(d.getTime())
}

/** Short past-tense time, e.g. "just now", "5m ago", "yesterday", "Oct 3". */
export function formatRelative(ts: number) {
  const diff = Date.now() - ts
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  const ago = daysAgo(ts)
  if (ago === 0) return `${Math.floor(diff / 3_600_000)}h ago`
  if (ago === 1) return 'yesterday'
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function formatDayHeading(ts: number) {
  const ago = daysAgo(ts)
  if (ago === 0) return 'Today'
  if (ago === 1) return 'Yesterday'
  const d = new Date(ts)
  const sameYear = d.getFullYear() === new Date().getFullYear()
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  })
}

export function formatLongDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}

export function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function greeting(now = new Date()) {
  const h = now.getHours()
  if (h < 5) return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

/** Start-of-day timestamps for the last `n` days, oldest first, ending today. */
export function lastNDays(n: number) {
  const days: number[] = []
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  for (let i = 0; i < n; i++) {
    days.unshift(d.getTime())
    d.setDate(d.getDate() - 1)
  }
  return days
}

/** Consecutive days with at least one timestamp, ending today (or yesterday if today is empty). */
export function currentStreak(timestamps: number[]) {
  const days = new Set(timestamps.map(dayKey))
  const d = new Date()
  if (!days.has(dayKey(d.getTime()))) d.setDate(d.getDate() - 1)
  let streak = 0
  while (days.has(dayKey(d.getTime()))) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

/** Groups items (already sorted) into consecutive runs sharing the same calendar day. */
export function groupByDay<T extends { createdAt: number }>(items: T[]) {
  const groups: { key: string; ts: number; items: T[] }[] = []
  for (const item of items) {
    const key = dayKey(item.createdAt)
    const last = groups[groups.length - 1]
    if (last?.key === key) last.items.push(item)
    else groups.push({ key, ts: item.createdAt, items: [item] })
  }
  return groups
}

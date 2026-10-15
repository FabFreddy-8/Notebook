import type { Priority, Todo } from '../types'
import { addDaysKey, isToday } from './date'

export type TodoView = 'all' | 'today' | 'upcoming' | 'nodate'
export type TodoSort = 'due' | 'priority' | 'newest'
export type DueBucket = 'overdue' | 'today' | 'tomorrow' | 'week' | 'later' | 'none'

export const BUCKET_ORDER: DueBucket[] = ['overdue', 'today', 'tomorrow', 'week', 'later', 'none']

export const BUCKET_LABELS: Record<DueBucket, string> = {
  overdue: 'Overdue',
  today: 'Today',
  tomorrow: 'Tomorrow',
  week: 'Next 7 days',
  later: 'Later',
  none: 'No date',
}

export const PRIORITY_LABELS = ['None', 'Low', 'Medium', 'High'] as const

export function priorityColor(p: Priority) {
  return p ? `var(--prio-${p})` : 'var(--border-strong)'
}

function parseDue(due: string) {
  const [y, m, d] = due.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// "YYYY-MM-DD" strings compare correctly as plain strings.
export function dueBucket(due: string | null): DueBucket {
  if (!due) return 'none'
  const today = addDaysKey(0)
  if (due < today) return 'overdue'
  if (due === today) return 'today'
  if (due === addDaysKey(1)) return 'tomorrow'
  if (due <= addDaysKey(7)) return 'week'
  return 'later'
}

export function formatDue(due: string) {
  const bucket = dueBucket(due)
  if (bucket === 'today') return 'Today'
  if (bucket === 'tomorrow') return 'Tomorrow'
  if (due === addDaysKey(-1)) return 'Yesterday'
  const d = parseDue(due)
  if (bucket === 'week') return d.toLocaleDateString(undefined, { weekday: 'long' })
  const sameYear = d.getFullYear() === new Date().getFullYear()
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: sameYear ? undefined : 'numeric' })
}

/**
 * Whether a task belongs in a view. Completed tasks show in "Today" when they
 * were due or finished today, so the view doesn't fill up with old overdue ones.
 */
export function inView(view: TodoView, t: Todo) {
  const bucket = dueBucket(t.due)
  switch (view) {
    case 'all':
      return true
    case 'today':
      if (t.done) return bucket === 'today' || (t.completedAt !== null && isToday(t.completedAt))
      return bucket === 'overdue' || bucket === 'today'
    case 'upcoming':
      return bucket === 'tomorrow' || bucket === 'week' || bucket === 'later'
    case 'nodate':
      return bucket === 'none'
  }
}

function byDue(a: Todo, b: Todo) {
  if (a.due === b.due) return 0
  if (!a.due) return 1
  if (!b.due) return -1
  return a.due < b.due ? -1 : 1
}

export function compareTodos(sort: TodoSort) {
  return (a: Todo, b: Todo) => {
    switch (sort) {
      case 'due':
        return byDue(a, b) || b.priority - a.priority || a.createdAt - b.createdAt
      case 'priority':
        return b.priority - a.priority || byDue(a, b) || a.createdAt - b.createdAt
      case 'newest':
        return b.createdAt - a.createdAt
    }
  }
}

/** Splits (already sorted) tasks into due-date buckets, in bucket order. */
export function groupByBucket(todos: Todo[]) {
  const groups = new Map<DueBucket, Todo[]>()
  for (const t of todos) {
    const bucket = dueBucket(t.due)
    groups.set(bucket, [...(groups.get(bucket) ?? []), t])
  }
  return BUCKET_ORDER.filter((b) => groups.has(b)).map((bucket) => ({ bucket, items: groups.get(bucket)! }))
}

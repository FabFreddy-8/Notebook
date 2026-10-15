import { useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  CalendarIcon,
  ChevronDownIcon,
  FlagIcon,
  InboxIcon,
  LayersIcon,
  SearchIcon,
  SunIcon,
  XIcon,
} from '../components/Icons'
import { useLocation } from 'react-router-dom'
import { useToast } from '../components/Toast'
import TodoComposer from '../components/todo/TodoComposer'
import TodoItem from '../components/todo/TodoItem'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useTodos } from '../hooks/useTodos'
import { addDaysKey } from '../lib/date'
import { tagsByFrequency } from '../lib/tags'
import {
  BUCKET_LABELS,
  compareTodos,
  dueBucket,
  groupByBucket,
  inView,
  PRIORITY_LABELS,
  priorityColor,
  type TodoSort,
  type TodoView,
} from '../lib/todo'
import type { Priority, Todo, TodoFields } from '../types'

const VIEWS: { value: TodoView; label: string; Icon: typeof SunIcon }[] = [
  { value: 'all', label: 'All', Icon: LayersIcon },
  { value: 'today', label: 'Today', Icon: SunIcon },
  { value: 'upcoming', label: 'Upcoming', Icon: CalendarIcon },
  { value: 'nodate', label: 'No date', Icon: InboxIcon },
]

const SORTS: { value: TodoSort; label: string }[] = [
  { value: 'due', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'newest', label: 'Recently added' },
]

const PRIORITY_FILTERS: Priority[] = [3, 2, 1]

/** How long a just-checked task stays in place before moving to Completed. */
const SETTLE_MS = 900

export default function TodoPage() {
  const { todos, add, update, setDone, remove, restore } = useTodos()
  const [view, setView] = useLocalStorage<TodoView>('todo-view', 'all')
  const [sort, setSort] = useLocalStorage<TodoSort>('todo-sort', 'due')
  const [showCompleted, setShowCompleted] = useLocalStorage('todo-show-completed', true)
  const [query, setQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<Priority | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [settling, setSettling] = useState<ReadonlySet<string>>(new Set())
  const settleTimers = useRef(new Map<string, number>())
  const toast = useToast()
  const location = useLocation()

  const allTags = useMemo(() => tagsByFrequency(todos), [todos])

  const counts = useMemo(() => {
    const active = todos.filter((t) => !t.done)
    return {
      all: active.length,
      today: active.filter((t) => inView('today', t)).length,
      upcoming: active.filter((t) => inView('upcoming', t)).length,
      nodate: active.filter((t) => inView('nodate', t)).length,
      overdue: active.filter((t) => dueBucket(t.due) === 'overdue').length,
    } satisfies Record<TodoView | 'overdue', number>
  }, [todos])

  const { active, completed } = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = (t: Todo) =>
      inView(view, t) &&
      (priorityFilter === null || t.priority === priorityFilter) &&
      (!tagFilter || t.tags.includes(tagFilter)) &&
      (!q || [t.text, t.notes, ...t.tags].some((s) => s.toLowerCase().includes(q)))

    const visible = todos.filter(matches)
    return {
      active: visible.filter((t) => !t.done || settling.has(t.id)).sort(compareTodos(sort)),
      completed: visible
        .filter((t) => t.done && !settling.has(t.id))
        .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0)),
    }
  }, [todos, view, sort, query, priorityFilter, tagFilter, settling])

  const filtering = Boolean(query.trim() || priorityFilter !== null || tagFilter)
  const viewTotal = active.length + completed.length
  const viewDone = completed.length + active.filter((t) => t.done).length

  function clearFilters() {
    setQuery('')
    setPriorityFilter(null)
    setTagFilter(null)
  }

  function settle(id: string, on: boolean) {
    window.clearTimeout(settleTimers.current.get(id))
    setSettling((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
    if (on) settleTimers.current.set(id, window.setTimeout(() => settle(id, false), SETTLE_MS))
  }

  function toggle(todo: Todo) {
    const done = !todo.done
    setDone(todo.id, done)
    settle(todo.id, done)
    if (done) {
      toast({ message: 'Task completed', action: { label: 'Undo', onClick: () => setDone(todo.id, false) } })
    }
  }

  function save(id: string, fields: TodoFields) {
    update(id, fields)
    setEditingId(null)
  }

  /** Removes tasks, offering an undo that puts them back where they were. */
  function removeWithUndo(removed: Todo[], message: string) {
    const snapshot = todos
    remove(removed.map((t) => t.id))
    toast({ message, action: { label: 'Undo', onClick: () => restore(snapshot, removed) } })
  }

  function renderItem(todo: Todo) {
    return (
      <TodoItem
        key={todo.id}
        todo={todo}
        editing={editingId === todo.id}
        settling={settling.has(todo.id)}
        tagSuggestions={allTags}
        onToggle={() => toggle(todo)}
        onEdit={() => setEditingId(todo.id)}
        onSave={(fields) => save(todo.id, fields)}
        onCancelEdit={() => setEditingId(null)}
        onDelete={() => removeWithUndo([todo], 'Task deleted')}
        onTagClick={setTagFilter}
      />
    )
  }

  const groups = sort === 'due' ? groupByBucket(active) : [{ bucket: null, items: active }]

  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">Workspace / Tasks</p>
        <h1 className="page-title">Todo</h1>
        <p className="page-subtitle">
          {counts.all === 0
            ? todos.length
              ? 'All done — nice work.'
              : 'A clean slate. Add your first task below.'
            : [
                `${counts.all} open`,
                counts.today && `${counts.today} due today`,
                counts.overdue && `${counts.overdue} overdue`,
              ]
                .filter(Boolean)
                .join(' · ')}
        </p>
      </header>

      <nav className="view-cards" aria-label="Task views">
        {VIEWS.map(({ value, label, Icon }) => (
          <button
            key={value}
            className={view === value ? `view-card view-${value} active` : `view-card view-${value}`}
            aria-pressed={view === value}
            onClick={() => setView(value)}
          >
            <span className="view-card-top">
              <Icon width={17} height={17} />
              <span className="view-count">{counts[value]}</span>
            </span>
            <span className="view-label">
              {label}
              {value === 'today' && counts.overdue > 0 && (
                <span className="view-badge">{counts.overdue} overdue</span>
              )}
            </span>
          </button>
        ))}
      </nav>

      {/* Remount per view so the default due date follows the view. */}
      <TodoComposer
        key={view}
        onAdd={add}
        defaultDue={view === 'today' ? addDaysKey(0) : null}
        focusSignal={(location.state as { focusNew?: boolean } | null)?.focusNew ? location.key : undefined}
      />

      {todos.length > 0 && (
        <div className="filters">
          <label className="search">
            <SearchIcon width={16} height={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks"
              aria-label="Search tasks"
            />
          </label>
          <div className="prio-filter" role="group" aria-label="Filter by priority">
            {PRIORITY_FILTERS.map((p) => (
              <button
                key={p}
                className={priorityFilter === p ? 'chip prio-option active' : 'chip prio-option'}
                style={{ '--prio-color': priorityColor(p) } as CSSProperties}
                aria-pressed={priorityFilter === p}
                title={`Only ${PRIORITY_LABELS[p].toLowerCase()} priority`}
                onClick={() => setPriorityFilter(priorityFilter === p ? null : p)}
              >
                <FlagIcon width={13} height={13} />
                {PRIORITY_LABELS[p]}
              </button>
            ))}
          </div>
          <label className="sort">
            <span>Sort</span>
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value as TodoSort)}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          {filtering && (
            <div className="filter-summary">
              <span>
                {viewTotal} {viewTotal === 1 ? 'match' : 'matches'}
              </span>
              {tagFilter && (
                <button className="chip active" onClick={() => setTagFilter(null)}>
                  #{tagFilter} <XIcon width={12} height={12} />
                </button>
              )}
              <button className="text-button" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {viewTotal > 0 && (
        <div className="list-progress">
          <div className="progress" aria-hidden="true">
            <div className="progress-bar" style={{ width: `${(viewDone / viewTotal) * 100}%` }} />
          </div>
          <span>
            {viewDone} of {viewTotal} done
          </span>
        </div>
      )}

      {todos.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">Nothing on your list</p>
          <p>Add a task above. Pick a due date and priority, or type #tags right in the text.</p>
        </div>
      ) : active.length === 0 ? (
        <div className="empty-state compact">
          <p className="empty-title">
            {filtering ? 'No matching tasks' : completed.length ? 'All caught up' : `Nothing ${emptyViewText(view)}`}
          </p>
          {filtering && (
            <button className="btn btn-ghost" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        groups.map(({ bucket, items }) => (
          <section key={bucket ?? 'all'} className="task-group">
            {bucket && (
              <h2 className={`task-group-heading bucket-${bucket}`}>
                {BUCKET_LABELS[bucket]}
                <span className="task-group-count">{items.length}</span>
              </h2>
            )}
            <ul className="task-list">{items.map(renderItem)}</ul>
          </section>
        ))
      )}

      {completed.length > 0 && (
        <section className="completed-section">
          <div className="completed-header">
            <button
              className="completed-toggle"
              aria-expanded={showCompleted}
              onClick={() => setShowCompleted(!showCompleted)}
            >
              <ChevronDownIcon width={16} height={16} className={showCompleted ? 'chevron open' : 'chevron'} />
              Completed
              <span className="task-group-count">{completed.length}</span>
            </button>
            <button
              className="text-button"
              onClick={() =>
                removeWithUndo(completed, `Cleared ${completed.length} completed ${completed.length === 1 ? 'task' : 'tasks'}`)
              }
            >
              Clear
            </button>
          </div>
          {showCompleted && <ul className="task-list completed-list">{completed.map(renderItem)}</ul>}
        </section>
      )}
    </div>
  )
}

function emptyViewText(view: TodoView) {
  switch (view) {
    case 'all':
      return 'to do'
    case 'today':
      return 'due today'
    case 'upcoming':
      return 'coming up'
    case 'nodate':
      return 'without a date'
  }
}

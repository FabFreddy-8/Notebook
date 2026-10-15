import { useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useJournal } from '../hooks/useJournal'
import { useTodos } from '../hooks/useTodos'
import { currentStreak, lastNDays } from '../lib/date'
import { averageMood, moodInfo } from '../lib/mood'
import { dueBucket } from '../lib/todo'
import { BookIcon, ChecklistIcon, PenIcon, PlusIcon, XIcon } from './Icons'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

type Props = { open: boolean; onClose: () => void }

export default function Sidebar({ open, onClose }: Props) {
  const navigate = useNavigate()
  const { entries } = useJournal()
  const { todos } = useTodos()

  const status = useMemo(() => {
    const weekStart = lastNDays(7)[0]
    const open = todos.filter((t) => !t.done)
    const buckets = open.map((t) => dueBucket(t.due))
    return {
      streak: currentStreak(entries.map((e) => e.createdAt)),
      weekMood: averageMood(entries.filter((e) => e.createdAt >= weekStart).map((e) => e.mood)),
      open: open.length,
      dueToday: buckets.filter((b) => b === 'today').length,
      overdue: buckets.filter((b) => b === 'overdue').length,
    }
  }, [entries, todos])

  return (
    <>
      <aside className={open ? 'sidebar open' : 'sidebar'} aria-label="Main navigation">
        <div className="sb-brand">
          <Logo />
          <span className="sb-brand-name">Notebook</span>
          <span className="sb-version">v3</span>
          <button className="icon-button sb-close" onClick={onClose} aria-label="Close menu">
            <XIcon />
          </button>
        </div>

        <div className="sb-actions">
          <button className="sb-new" onClick={() => navigate('/journal/new')} title="New entry">
            <PenIcon width={17} height={17} />
            <span className="sb-text">New entry</span>
          </button>
          <button
            className="sb-new-task"
            onClick={() => navigate('/todo', { state: { focusNew: true } })}
            title="New task"
          >
            <PlusIcon width={17} height={17} />
            <span className="sb-text">New task</span>
          </button>
        </div>

        <nav className="sb-nav">
          <p className="sb-label">Workspace</p>
          <NavLink to="/journal" className="sb-link" title="Journal">
            <BookIcon width={18} height={18} />
            <span className="sb-text">Journal</span>
            <span className="sb-count">{entries.length}</span>
          </NavLink>
          <NavLink to="/todo" className="sb-link" title="Todo">
            <ChecklistIcon width={18} height={18} />
            <span className="sb-text">Todo</span>
            <span className={status.overdue ? 'sb-count alert' : 'sb-count'}>{status.open}</span>
          </NavLink>
        </nav>

        <section className="sb-status" aria-label="Status">
          <p className="sb-label">Status</p>
          <dl>
            <div>
              <dt>Streak</dt>
              <dd>{status.streak}d</dd>
            </div>
            <div>
              <dt>Mood · 7d</dt>
              <dd>{status.weekMood ? moodInfo(status.weekMood).label : '—'}</dd>
            </div>
            <div>
              <dt>Due today</dt>
              <dd>{status.dueToday}</dd>
            </div>
            <div>
              <dt>Overdue</dt>
              <dd className={status.overdue ? 'alert' : undefined}>{status.overdue}</dd>
            </div>
          </dl>
        </section>

        <div className="sb-footer">
          <ThemeToggle />
        </div>
      </aside>
      <div className={open ? 'scrim visible' : 'scrim'} onClick={onClose} aria-hidden="true" />
    </>
  )
}

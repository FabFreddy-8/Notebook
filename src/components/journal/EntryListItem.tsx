import type { CSSProperties } from 'react'
import { NavLink } from 'react-router-dom'
import { formatTime } from '../../lib/date'
import { moodColor, moodInfo } from '../../lib/mood'
import type { Entry } from '../../types'

/** One row in the entry list pane. */
export default function EntryListItem({ entry }: { entry: Entry }) {
  const mood = entry.mood ? moodInfo(entry.mood) : null
  const title = entry.title || (mood ? `Feeling ${mood.label.toLowerCase()}` : 'Untitled entry')
  const snippet = entry.body || entry.gratitude

  return (
    <NavLink
      to={`/journal/${entry.id}`}
      className="entry-item"
      style={{ '--mood-color': moodColor(entry.mood) } as CSSProperties}
    >
      <div className="entry-item-top">
        <span className="entry-item-title">{title}</span>
        {mood && (
          <span className="entry-item-mood" title={mood.label} aria-label={`Mood: ${mood.label}`}>
            {mood.emoji}
          </span>
        )}
      </div>
      {snippet && <p className="entry-item-snippet">{snippet}</p>}
      <div className="entry-item-meta">
        <time>{formatTime(entry.createdAt)}</time>
        {entry.tags.slice(0, 3).map((t) => (
          <span key={t}>#{t}</span>
        ))}
        {entry.tags.length > 3 && <span>+{entry.tags.length - 3}</span>}
      </div>
    </NavLink>
  )
}

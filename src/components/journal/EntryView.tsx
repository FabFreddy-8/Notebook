import type { CSSProperties, ReactNode } from 'react'
import { formatTime } from '../../lib/date'
import { moodColor, moodInfo } from '../../lib/mood'
import type { Entry } from '../../types'
import { PencilIcon, SparkleIcon, TrashIcon } from '../Icons'
import { EnergyMeter } from './EnergyPicker'

type Props = {
  entry: Entry
  leading?: ReactNode
  onEdit: () => void
  onDelete: () => void
  onTagClick: (tag: string) => void
}

function formatFullDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

/** Read-only view of an entry in the detail pane. */
export default function EntryView({ entry, leading, onEdit, onDelete, onTagClick }: Props) {
  const mood = entry.mood ? moodInfo(entry.mood) : null
  const words = entry.body.trim().match(/\S+/g)?.length ?? 0
  const edited = entry.updatedAt - entry.createdAt > 60_000

  return (
    <article className="doc" style={{ '--mood-color': moodColor(entry.mood) } as CSSProperties}>
      <div className="doc-toolbar">
        {leading}
        <span className="doc-toolbar-label">
          {formatFullDate(entry.createdAt)} · {formatTime(entry.createdAt)}
        </span>
        <div className="doc-toolbar-actions">
          <button className="btn btn-ghost" onClick={onEdit}>
            <PencilIcon width={15} height={15} />
            <span className="hide-sm">Edit</span>
          </button>
          <button className="icon-button danger" onClick={onDelete} aria-label="Delete entry" title="Delete">
            <TrashIcon width={16} height={16} />
          </button>
        </div>
      </div>

      <div className="doc-scroll">
        <div className="doc-inner">
          <h1 className="doc-title">{entry.title || (mood ? `Feeling ${mood.label.toLowerCase()}` : 'Untitled entry')}</h1>

          {(mood || entry.energy || entry.tags.length > 0) && (
            <div className="props">
              {mood && (
                <div className="prop">
                  <span className="prop-key">Mood</span>
                  <span className="mood-pill">
                    <span aria-hidden="true">{mood.emoji}</span>
                    {mood.label}
                  </span>
                </div>
              )}
              {entry.energy && (
                <div className="prop">
                  <span className="prop-key">Energy</span>
                  <EnergyMeter value={entry.energy} />
                </div>
              )}
              {entry.tags.length > 0 && (
                <div className="prop">
                  <span className="prop-key">Tags</span>
                  <div className="tag-row">
                    {entry.tags.map((tag) => (
                      <button key={tag} className="tag tag-button" onClick={() => onTagClick(tag)} title={`Show #${tag}`}>
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {entry.body ? (
            <div className="doc-body">{entry.body}</div>
          ) : (
            <p className="doc-body muted">A quick mood check-in — no notes written.</p>
          )}

          {entry.gratitude && (
            <div className="gratitude">
              <SparkleIcon width={16} height={16} />
              <div>
                <span className="gratitude-label">One good thing</span>
                <p>{entry.gratitude}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="doc-statusbar">
        <span>
          {words} {words === 1 ? 'word' : 'words'}
        </span>
        {edited && <span>Edited {formatTime(entry.updatedAt)}</span>}
      </div>
    </article>
  )
}

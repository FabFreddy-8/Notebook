import { useMemo, useState, type CSSProperties } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon, BookIcon, PenIcon, SearchIcon, XIcon } from '../components/Icons'
import EntryComposer from '../components/journal/EntryComposer'
import EntryListItem from '../components/journal/EntryListItem'
import EntryView from '../components/journal/EntryView'
import JournalStats from '../components/journal/JournalStats'
import { useToast } from '../components/Toast'
import { EMPTY_DRAFT, isDraftEmpty, toDraft, useJournal } from '../hooks/useJournal'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { formatDayHeading, groupByDay } from '../lib/date'
import { MOODS } from '../lib/mood'
import { tagsByFrequency } from '../lib/tags'
import type { Entry, EntryDraft, Mood } from '../types'

/**
 * Two panes, Evernote-style: the entry list and a detail pane.
 * Routes: /journal (new-entry editor on desktop, list only on mobile),
 * /journal/new, /journal/:id.
 */
export default function JournalPage() {
  const { entryId } = useParams()
  const navigate = useNavigate()
  const { entries, add, update, remove, restore } = useJournal()
  const [storedDraft, setDraft] = useLocalStorage<EntryDraft>('journal-draft', EMPTY_DRAFT)
  const draft = { ...EMPTY_DRAFT, ...storedDraft }
  const [editing, setEditing] = useState<{ id: string; draft: EntryDraft } | null>(null)
  const [query, setQuery] = useState('')
  const [moodFilter, setMoodFilter] = useState<Mood | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const toast = useToast()

  const allTags = useMemo(() => tagsByFrequency(entries), [entries])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entries.filter(
      (e) =>
        (!moodFilter || e.mood === moodFilter) &&
        (!tagFilter || e.tags.includes(tagFilter)) &&
        (!q || [e.title, e.body, e.gratitude, ...e.tags].some((s) => s.toLowerCase().includes(q))),
    )
  }, [entries, query, moodFilter, tagFilter])

  const groups = useMemo(() => groupByDay(filtered), [filtered])
  const filtering = Boolean(query.trim() || moodFilter || tagFilter)
  const selected = entryId && entryId !== 'new' ? entries.find((e) => e.id === entryId) : undefined
  const draftEmpty = isDraftEmpty(draft)

  function clearFilters() {
    setQuery('')
    setMoodFilter(null)
    setTagFilter(null)
  }

  function saveDraft() {
    const id = add(draft)
    setDraft(EMPTY_DRAFT)
    navigate(`/journal/${id}`)
    toast({ message: 'Entry saved' })
  }

  function discardDraft() {
    const previous = draft
    setDraft(EMPTY_DRAFT)
    toast({ message: 'Draft discarded', action: { label: 'Undo', onClick: () => setDraft(previous) } })
  }

  function deleteEntry(entry: Entry) {
    remove(entry.id)
    setEditing(null)
    navigate('/journal')
    toast({ message: 'Entry deleted', action: { label: 'Undo', onClick: () => restore(entry) } })
  }

  /** Filters the list by tag; on narrow screens the list is hidden behind the entry, so go back to it. */
  function showTag(tag: string) {
    setTagFilter(tag)
    if (window.matchMedia('(max-width: 899px)').matches) navigate('/journal')
  }

  function saveEdit() {
    if (!editing) return
    update(editing.id, editing.draft)
    setEditing(null)
    toast({ message: 'Entry updated' })
  }

  const back = (
    <Link to="/journal" className="icon-button mobile-only" aria-label="Back to entries">
      <ArrowLeftIcon />
    </Link>
  )

  let detail
  if (selected) {
    detail =
      editing?.id === selected.id ? (
        <EntryComposer
          key={`edit-${selected.id}`}
          heading="Editing entry"
          leading={back}
          value={editing.draft}
          onChange={(d) => setEditing({ id: selected.id, draft: d })}
          onSubmit={saveEdit}
          submitLabel="Save"
          onCancel={() => setEditing(null)}
          status="Unsaved changes"
          tagSuggestions={allTags}
          autoFocus
        />
      ) : (
        <EntryView
          key={selected.id}
          entry={selected}
          leading={back}
          onEdit={() => setEditing({ id: selected.id, draft: toDraft(selected) })}
          onDelete={() => deleteEntry(selected)}
          onTagClick={showTag}
        />
      )
  } else if (entryId && entryId !== 'new') {
    detail = (
      <div className="doc doc-empty">
        <BookIcon width={32} height={32} />
        <p className="empty-title">Entry not found</p>
        <p>It may have been deleted.</p>
        <Link to="/journal/new" className="btn btn-primary">
          Write a new entry
        </Link>
      </div>
    )
  } else {
    detail = (
      <EntryComposer
        key="new"
        heading={draftEmpty ? 'New entry' : 'Draft'}
        leading={back}
        value={draft}
        onChange={setDraft}
        onSubmit={saveDraft}
        submitLabel="Save entry"
        onCancel={draftEmpty ? undefined : discardDraft}
        cancelLabel="Discard"
        status={draftEmpty ? 'Ready' : 'Draft saved'}
        tagSuggestions={allTags}
        autoFocus={entryId === 'new'}
      />
    )
  }

  return (
    <div className="split" data-detail={entryId ? 'open' : 'closed'}>
      <section className="list-pane" aria-label="Entries">
        <header className="pane-header">
          <div>
            <p className="eyebrow">Journal</p>
            <h1 className="pane-title">
              Entries <span className="pane-count">{entries.length}</span>
            </h1>
          </div>
          <Link to="/journal/new" className="btn btn-primary btn-icon-sm" title="New entry" aria-label="New entry">
            <PenIcon width={16} height={16} />
          </Link>
        </header>

        {entries.length > 0 && <JournalStats entries={entries} />}

        {entries.length > 0 && (
          <div className="pane-filters">
            <label className="search">
              <SearchIcon width={15} height={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search entries"
                aria-label="Search entries"
              />
              {query && (
                <button className="icon-button small" onClick={() => setQuery('')} aria-label="Clear search">
                  <XIcon width={13} height={13} />
                </button>
              )}
            </label>
            <div className="mood-filter" role="group" aria-label="Filter by mood">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  className={moodFilter === m.value ? 'mood-chip active' : 'mood-chip'}
                  style={{ '--mood-color': `var(--mood-${m.value})` } as CSSProperties}
                  aria-pressed={moodFilter === m.value}
                  title={`Only "${m.label}" entries`}
                  onClick={() => setMoodFilter(moodFilter === m.value ? null : m.value)}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
            {filtering && (
              <div className="filter-summary">
                <span>
                  {filtered.length}/{entries.length} shown
                </span>
                {tagFilter && (
                  <button className="tag tag-button" onClick={() => setTagFilter(null)}>
                    #{tagFilter} <XIcon width={11} height={11} />
                  </button>
                )}
                <button className="text-button" onClick={clearFilters}>
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        <div className="list-scroll">
          {entries.length === 0 ? (
            <div className="empty-state">
              <p className="empty-title">No entries yet</p>
              <p>Log a mood for a quick check-in, or write about your day.</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="empty-state">
              <p className="empty-title">No matches</p>
              <button className="btn btn-ghost" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.key} className="list-group">
                <h2 className="list-group-heading">{formatDayHeading(group.ts)}</h2>
                {group.items.map((entry) => (
                  <EntryListItem key={entry.id} entry={entry} />
                ))}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="detail-pane" aria-label="Entry">
        {detail}
      </section>
    </div>
  )
}

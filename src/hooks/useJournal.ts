import { useMemo } from 'react'
import type { Entry, EntryDraft } from '../types'
import { useLocalStorage } from './useLocalStorage'

export const EMPTY_DRAFT: EntryDraft = { title: '', body: '', mood: null, energy: null, tags: [], gratitude: '' }

/** Fills in fields missing from entries saved by older versions of the app. */
function normalize(raw: Partial<Entry> & Pick<Entry, 'id' | 'createdAt'>): Entry {
  return { ...EMPTY_DRAFT, updatedAt: raw.createdAt, ...raw }
}

export function toDraft({ title, body, mood, energy, tags, gratitude }: Entry): EntryDraft {
  return { title, body, mood, energy, tags, gratitude }
}

export function isDraftEmpty(d: EntryDraft) {
  return !d.title.trim() && !d.body.trim() && !d.mood && !d.energy && d.tags.length === 0 && !d.gratitude.trim()
}

/** An entry needs at least a mood, a title or some writing. */
export function canSaveDraft(d: EntryDraft) {
  return Boolean(d.mood || d.title.trim() || d.body.trim())
}

function clean(d: EntryDraft): EntryDraft {
  return { ...d, title: d.title.trim(), body: d.body.trim(), gratitude: d.gratitude.trim() }
}

export function useJournal() {
  const [raw, setRaw] = useLocalStorage<Entry[]>('journal-entries', [])

  const entries = useMemo(() => raw.map(normalize).sort((a, b) => b.createdAt - a.createdAt), [raw])

  function add(draft: EntryDraft) {
    const now = Date.now()
    const id = crypto.randomUUID()
    setRaw((prev) => [{ ...clean(draft), id, createdAt: now, updatedAt: now }, ...prev])
    return id
  }

  function update(id: string, draft: EntryDraft) {
    setRaw((prev) =>
      prev.map((e) => (e.id === id ? { ...normalize(e), ...clean(draft), updatedAt: Date.now() } : e)),
    )
  }

  function remove(id: string) {
    setRaw((prev) => prev.filter((e) => e.id !== id))
  }

  function restore(entry: Entry) {
    setRaw((prev) => (prev.some((e) => e.id === entry.id) ? prev : [...prev, entry]))
  }

  return { entries, add, update, remove, restore }
}

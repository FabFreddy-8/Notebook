import type { FormEvent, KeyboardEvent, ReactNode } from 'react'
import { canSaveDraft } from '../../hooks/useJournal'
import type { EntryDraft } from '../../types'
import AutoTextarea from '../AutoTextarea'
import { SparkleIcon } from '../Icons'
import TagInput from '../TagInput'
import EnergyPicker from './EnergyPicker'
import MoodPicker from './MoodPicker'

type Props = {
  value: EntryDraft
  onChange: (draft: EntryDraft) => void
  onSubmit: () => void
  submitLabel: string
  /** Mono label in the toolbar, e.g. "New entry". */
  heading: string
  /** Rendered at the start of the toolbar (the mobile back button). */
  leading?: ReactNode
  /** Shown as a secondary button; also bound to Escape. */
  onCancel?: () => void
  cancelLabel?: string
  /** Shown in the status bar, e.g. "Draft saved". */
  status?: string
  tagSuggestions?: string[]
  autoFocus?: boolean
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

function countWords(text: string) {
  return text.trim().match(/\S+/g)?.length ?? 0
}

/** Full-pane editor for a journal entry. */
export default function EntryComposer({
  value,
  onChange,
  onSubmit,
  submitLabel,
  heading,
  leading,
  onCancel,
  cancelLabel = 'Cancel',
  status,
  tagSuggestions,
  autoFocus,
}: Props) {
  const set = <K extends keyof EntryDraft>(key: K, v: EntryDraft[K]) => onChange({ ...value, [key]: v })
  const canSave = canSaveDraft(value)
  const words = countWords(value.body)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (canSave) onSubmit()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLFormElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      if (canSave) onSubmit()
    } else if (e.key === 'Escape' && onCancel) {
      e.preventDefault()
      onCancel()
    } else if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      // Plain Enter in a single-line field shouldn't submit the whole entry.
      e.preventDefault()
    }
  }

  return (
    <form className="doc" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <div className="doc-toolbar">
        {leading}
        <span className="doc-toolbar-label">
          <span className="pulse" aria-hidden="true" />
          {heading}
        </span>
        <div className="doc-toolbar-actions">
          {onCancel && (
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={!canSave}>
            {submitLabel}
          </button>
        </div>
      </div>

      <div className="doc-scroll">
        <div className="doc-inner">
          <input
            className="doc-title-input"
            value={value.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Untitled entry"
            aria-label="Title"
          />

          <div className="props">
            <div className="prop">
              <span className="prop-key">Mood</span>
              <MoodPicker value={value.mood} onChange={(m) => set('mood', m)} />
            </div>
            <div className="prop">
              <span className="prop-key">Energy</span>
              <EnergyPicker value={value.energy} onChange={(v) => set('energy', v)} />
            </div>
            <div className="prop">
              <span className="prop-key">Tags</span>
              <TagInput value={value.tags} onChange={(t) => set('tags', t)} suggestions={tagSuggestions} />
            </div>
          </div>

          <AutoTextarea
            className="doc-body-input"
            value={value.body}
            onChange={(e) => set('body', e.target.value)}
            placeholder="Start writing about your day…"
            aria-label="Entry"
            autoFocus={autoFocus}
            rows={8}
          />

          <label className="gratitude-input">
            <SparkleIcon width={16} height={16} />
            <input
              value={value.gratitude}
              onChange={(e) => set('gratitude', e.target.value)}
              placeholder="One good thing today…"
              aria-label="One good thing today"
            />
          </label>
        </div>
      </div>

      <div className="doc-statusbar">
        <span>{status ?? 'Unsaved'}</span>
        <span>
          {words} {words === 1 ? 'word' : 'words'}
        </span>
        <span className="hide-sm">{isMac ? '⌘' : 'Ctrl'}+Enter to save</span>
      </div>
    </form>
  )
}

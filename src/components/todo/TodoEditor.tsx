import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { extractTags } from '../../lib/tags'
import type { Todo, TodoFields } from '../../types'
import AutoTextarea from '../AutoTextarea'
import TagInput from '../TagInput'
import DuePicker from './DuePicker'
import PriorityPicker from './PriorityPicker'

type Props = {
  todo: Todo
  onSave: (fields: TodoFields) => void
  onCancel: () => void
  tagSuggestions: string[]
}

export default function TodoEditor({ todo, onSave, onCancel, tagSuggestions }: Props) {
  const [fields, setFields] = useState<TodoFields>({
    text: todo.text,
    notes: todo.notes,
    due: todo.due,
    priority: todo.priority,
    tags: todo.tags,
  })
  const set = <K extends keyof TodoFields>(key: K, v: TodoFields[K]) => setFields((f) => ({ ...f, [key]: v }))

  function save(e?: FormEvent) {
    e?.preventDefault()
    const parsed = extractTags(fields.text)
    if (!parsed.text) return
    onSave({ ...fields, text: parsed.text, notes: fields.notes.trim(), tags: [...new Set([...fields.tags, ...parsed.tags])] })
  }

  function onKeyDown(e: KeyboardEvent<HTMLFormElement>) {
    if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || e.target instanceof HTMLInputElement)) {
      // TagInput handles its own Enter (and stops it) before this runs.
      if (e.defaultPrevented) return
      e.preventDefault()
      save()
    }
  }

  return (
    <form className="task-editor" onSubmit={save} onKeyDown={onKeyDown}>
      <input
        className="task-editor-text"
        value={fields.text}
        onChange={(e) => set('text', e.target.value)}
        aria-label="Task"
        autoFocus
      />
      <AutoTextarea
        className="task-editor-notes"
        value={fields.notes}
        onChange={(e) => set('notes', e.target.value)}
        placeholder="Notes"
        aria-label="Notes"
        rows={1}
      />
      <div className="task-editor-fields">
        <div className="field">
          <span className="field-label">Due</span>
          <DuePicker value={fields.due} onChange={(d) => set('due', d)} />
        </div>
        <div className="field">
          <span className="field-label">Priority</span>
          <PriorityPicker value={fields.priority} onChange={(p) => set('priority', p)} />
        </div>
        <div className="field">
          <span className="field-label">Tags</span>
          <TagInput value={fields.tags} onChange={(t) => set('tags', t)} suggestions={tagSuggestions} />
        </div>
      </div>
      <div className="task-editor-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={!fields.text.trim()}>
          Save
        </button>
      </div>
    </form>
  )
}

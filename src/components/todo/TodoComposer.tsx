import { useEffect, useRef, useState, type FormEvent } from 'react'
import { extractTags } from '../../lib/tags'
import type { Priority, TodoFields } from '../../types'
import DuePicker from './DuePicker'
import PriorityPicker from './PriorityPicker'

type Props = {
  onAdd: (fields: TodoFields) => void
  defaultDue?: string | null
  /** Focuses the input whenever this changes to a new defined value. */
  focusSignal?: string
}

/** Quick-add form. "#word" in the text becomes a tag. */
export default function TodoComposer({ onAdd, defaultDue = null, focusSignal }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState('')
  const [due, setDue] = useState<string | null>(defaultDue)
  const [priority, setPriority] = useState<Priority>(0)

  useEffect(() => {
    if (focusSignal) inputRef.current?.focus()
  }, [focusSignal])

  const parsed = extractTags(text)
  const expanded = Boolean(text.trim() || priority || due !== defaultDue)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!parsed.text) return
    onAdd({ text: parsed.text, tags: parsed.tags, due, priority, notes: '' })
    setText('')
    setDue(defaultDue)
    setPriority(0)
  }

  return (
    <form className={expanded ? 'todo-composer expanded' : 'todo-composer'} onSubmit={submit}>
      <div className="todo-composer-row">
        <span className="composer-plus" aria-hidden="true">+</span>
        <input
          ref={inputRef}
          className="todo-new"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a task — use #tags to organize"
          aria-label="New task"
        />
        <button type="submit" className="btn btn-primary" disabled={!parsed.text}>
          Add
        </button>
      </div>
      <div className="todo-composer-options">
        <DuePicker value={due} onChange={setDue} />
        <PriorityPicker value={priority} onChange={setPriority} />
        {parsed.tags.length > 0 && (
          <div className="tag-preview">
            {parsed.tags.map((t) => (
              <span key={t} className="tag">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </form>
  )
}

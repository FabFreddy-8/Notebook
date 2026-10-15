import { useState, type KeyboardEvent } from 'react'
import { XIcon } from './Icons'

type Props = { value: string[]; onChange: (tags: string[]) => void; suggestions?: string[] }

function toTag(text: string) {
  return text.trim().replace(/^#+/, '').toLowerCase()
}

export default function TagInput({ value, onChange, suggestions = [] }: Props) {
  const [text, setText] = useState('')

  function commit(raw = text) {
    const tag = toTag(raw)
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setText('')
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.metaKey || e.ctrlKey) return
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Backspace' && !text && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  const query = toTag(text)
  const matches = query
    ? suggestions.filter((s) => s.startsWith(query) && s !== query && !value.includes(s)).slice(0, 4)
    : []

  return (
    <div className="tag-field">
      <div className="tag-input">
        {value.map((tag) => (
          <span key={tag} className="tag">
            #{tag}
            <button
              type="button"
              className="tag-remove"
              aria-label={`Remove tag ${tag}`}
              onClick={() => onChange(value.filter((t) => t !== tag))}
            >
              <XIcon width={12} height={12} />
            </button>
          </span>
        ))}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => commit()}
          placeholder={value.length ? '' : 'work, family, run…'}
          aria-label="Add tag"
        />
      </div>
      {matches.length > 0 && (
        <div className="tag-suggestions">
          {matches.map((s) => (
            <button
              key={s}
              type="button"
              className="chip"
              // mousedown so the input's blur doesn't commit the partial text first
              onMouseDown={(e) => {
                e.preventDefault()
                commit(s)
              }}
            >
              #{s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

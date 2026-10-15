import type { CSSProperties } from 'react'
import { MOODS } from '../../lib/mood'
import type { Mood } from '../../types'

type Props = { value: Mood | null; onChange: (mood: Mood | null) => void }

export default function MoodPicker({ value, onChange }: Props) {
  return (
    <div className="mood-picker" role="group" aria-label="Mood">
      {MOODS.map((m) => {
        const selected = value === m.value
        return (
          <button
            key={m.value}
            type="button"
            className={selected ? 'mood-option selected' : 'mood-option'}
            style={{ '--mood-color': `var(--mood-${m.value})` } as CSSProperties}
            aria-pressed={selected}
            onClick={() => onChange(selected ? null : m.value)}
          >
            <span className="mood-emoji">{m.emoji}</span>
            <span className="mood-label">{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}

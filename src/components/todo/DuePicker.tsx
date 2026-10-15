import { useRef } from 'react'
import { addDaysKey } from '../../lib/date'
import { formatDue } from '../../lib/todo'
import { CalendarIcon, XIcon } from '../Icons'

type Props = { value: string | null; onChange: (due: string | null) => void }

export default function DuePicker({ value, onChange }: Props) {
  const dateRef = useRef<HTMLInputElement>(null)
  const quick = [
    { label: 'Today', due: addDaysKey(0) },
    { label: 'Tomorrow', due: addDaysKey(1) },
    { label: 'Next week', due: addDaysKey(7) },
  ]
  const isQuick = quick.some((q) => q.due === value)

  function openPicker() {
    const input = dateRef.current
    if (!input) return
    try {
      input.showPicker()
    } catch {
      input.focus()
    }
  }

  return (
    <div className="due-picker" role="group" aria-label="Due date">
      {quick.map((q) => (
        <button
          key={q.label}
          type="button"
          className={value === q.due ? 'chip active' : 'chip'}
          aria-pressed={value === q.due}
          onClick={() => onChange(value === q.due ? null : q.due)}
        >
          {q.label}
        </button>
      ))}
      <span className="date-chip-wrap">
        <button type="button" className={value && !isQuick ? 'chip active' : 'chip'} onClick={openPicker}>
          <CalendarIcon width={13} height={13} />
          {value && !isQuick ? formatDue(value) : 'Pick date'}
        </button>
        <input
          ref={dateRef}
          type="date"
          className="date-input-hidden"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          tabIndex={-1}
          aria-hidden="true"
        />
      </span>
      {value && (
        <button type="button" className="icon-button small" onClick={() => onChange(null)} aria-label="Clear due date">
          <XIcon width={14} height={14} />
        </button>
      )}
    </div>
  )
}

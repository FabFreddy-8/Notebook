import type { CSSProperties } from 'react'
import { PRIORITY_LABELS, priorityColor } from '../../lib/todo'
import type { Priority } from '../../types'
import { FlagIcon } from '../Icons'

const LEVELS: Priority[] = [3, 2, 1]

type Props = { value: Priority; onChange: (p: Priority) => void }

export default function PriorityPicker({ value, onChange }: Props) {
  return (
    <div className="prio-picker" role="group" aria-label="Priority">
      {LEVELS.map((p) => (
        <button
          key={p}
          type="button"
          className={value === p ? 'chip prio-option active' : 'chip prio-option'}
          style={{ '--prio-color': priorityColor(p) } as CSSProperties}
          aria-pressed={value === p}
          onClick={() => onChange(value === p ? 0 : p)}
        >
          <FlagIcon width={13} height={13} />
          {PRIORITY_LABELS[p]}
        </button>
      ))}
    </div>
  )
}

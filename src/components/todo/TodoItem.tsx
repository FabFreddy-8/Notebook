import type { CSSProperties } from 'react'
import { formatRelative } from '../../lib/date'
import { dueBucket, formatDue, PRIORITY_LABELS, priorityColor } from '../../lib/todo'
import type { Todo, TodoFields } from '../../types'
import { CalendarIcon, CheckIcon, FlagIcon, PencilIcon, TrashIcon } from '../Icons'
import TodoEditor from './TodoEditor'

type Props = {
  todo: Todo
  editing: boolean
  /** Just checked off — still shown in the active list for a moment. */
  settling?: boolean
  tagSuggestions: string[]
  onToggle: () => void
  onEdit: () => void
  onSave: (fields: TodoFields) => void
  onCancelEdit: () => void
  onDelete: () => void
  onTagClick: (tag: string) => void
}

export default function TodoItem({
  todo,
  editing,
  settling,
  tagSuggestions,
  onToggle,
  onEdit,
  onSave,
  onCancelEdit,
  onDelete,
  onTagClick,
}: Props) {
  const style = { '--prio-color': priorityColor(todo.priority) } as CSSProperties

  if (editing) {
    return (
      <li className="task editing" style={style}>
        <TodoEditor todo={todo} onSave={onSave} onCancel={onCancelEdit} tagSuggestions={tagSuggestions} />
      </li>
    )
  }

  const bucket = dueBucket(todo.due)
  const className = ['task', todo.done && 'done', settling && 'settling', todo.priority && `prio-${todo.priority}`]
    .filter(Boolean)
    .join(' ')

  return (
    <li className={className} style={style}>
      <input
        type="checkbox"
        className="task-check"
        checked={todo.done}
        onChange={onToggle}
        aria-label={todo.done ? `Mark "${todo.text}" as not done` : `Complete "${todo.text}"`}
      />
      <div className="task-main">
        <button className="task-text" onClick={onEdit} title="Edit task">
          {todo.text}
        </button>

        {todo.notes && !todo.done && <p className="task-notes">{todo.notes}</p>}

        <div className="task-meta">
          {todo.done ? (
            <span className="meta-item completed-at">
              <CheckIcon width={13} height={13} />
              {todo.completedAt ? `Completed ${formatRelative(todo.completedAt)}` : 'Completed'}
            </span>
          ) : (
            <>
              {todo.due && (
                <span className={`meta-item due-pill due-${bucket}`}>
                  <CalendarIcon width={13} height={13} />
                  {formatDue(todo.due)}
                </span>
              )}
              {todo.priority > 0 && (
                <span className="meta-item prio-label">
                  <FlagIcon width={13} height={13} />
                  {PRIORITY_LABELS[todo.priority]}
                </span>
              )}
            </>
          )}
          {todo.tags.map((tag) => (
            <button key={tag} className="task-tag" onClick={() => onTagClick(tag)} title={`Show #${tag}`}>
              #{tag}
            </button>
          ))}
        </div>
      </div>
      <div className="task-actions">
        <button className="icon-button" onClick={onEdit} aria-label="Edit task" title="Edit">
          <PencilIcon width={15} height={15} />
        </button>
        <button className="icon-button danger" onClick={onDelete} aria-label="Delete task" title="Delete">
          <TrashIcon width={15} height={15} />
        </button>
      </div>
    </li>
  )
}

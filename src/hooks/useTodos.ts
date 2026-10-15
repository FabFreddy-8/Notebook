import { useMemo } from 'react'
import { restoreRemoved } from '../lib/restore'
import type { Todo, TodoFields } from '../types'
import { useLocalStorage } from './useLocalStorage'

/** Fills in fields missing from tasks saved by older versions of the app. */
function normalize(raw: Partial<Todo> & Pick<Todo, 'id' | 'text'>): Todo {
  return { done: false, priority: 0, due: null, tags: [], notes: '', createdAt: 0, completedAt: null, ...raw }
}

export function useTodos() {
  const [raw, setRaw] = useLocalStorage<Todo[]>('todos', [])
  const todos = useMemo(() => raw.map(normalize), [raw])

  function add(fields: TodoFields) {
    const todo: Todo = { ...fields, id: crypto.randomUUID(), done: false, createdAt: Date.now(), completedAt: null }
    setRaw((prev) => [...prev, todo])
  }

  function update(id: string, patch: Partial<Todo>) {
    setRaw((prev) => prev.map((t) => (t.id === id ? { ...normalize(t), ...patch } : t)))
  }

  function setDone(id: string, done: boolean) {
    update(id, { done, completedAt: done ? Date.now() : null })
  }

  function remove(ids: string[]) {
    const set = new Set(ids)
    setRaw((prev) => prev.filter((t) => !set.has(t.id)))
  }

  /** Undo for `remove`: puts `removed` back where they were in `snapshot`. */
  function restore(snapshot: Todo[], removed: Todo[]) {
    setRaw((prev) => restoreRemoved(prev, snapshot, removed))
  }

  return { todos, add, update, setDone, remove, restore }
}

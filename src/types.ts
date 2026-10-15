export type Mood = 1 | 2 | 3 | 4 | 5

export type Entry = {
  id: string
  title: string
  body: string
  mood: Mood | null
  /** 1 (drained) – 5 (energized) */
  energy: number | null
  tags: string[]
  gratitude: string
  createdAt: number
  updatedAt: number
}

/** The user-editable part of an entry — what the composer works with. */
export type EntryDraft = Pick<Entry, 'title' | 'body' | 'mood' | 'energy' | 'tags' | 'gratitude'>

/** 0 none, 1 low, 2 medium, 3 high */
export type Priority = 0 | 1 | 2 | 3

export type Todo = {
  id: string
  text: string
  done: boolean
  priority: Priority
  /** Local calendar date, "YYYY-MM-DD" */
  due: string | null
  tags: string[]
  notes: string
  createdAt: number
  completedAt: number | null
}

/** The user-editable part of a task. */
export type TodoFields = Pick<Todo, 'text' | 'priority' | 'due' | 'tags' | 'notes'>

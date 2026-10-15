import type { Mood } from '../types'

export const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: 1, label: 'Awful', emoji: '😞' },
  { value: 2, label: 'Low', emoji: '😕' },
  { value: 3, label: 'Okay', emoji: '😐' },
  { value: 4, label: 'Good', emoji: '🙂' },
  { value: 5, label: 'Great', emoji: '😄' },
]

export const ENERGY_LABELS = ['Drained', 'Low', 'Steady', 'Good', 'Energized']

export function moodInfo(mood: Mood) {
  return MOODS[mood - 1]
}

export function moodColor(mood: Mood | null) {
  return mood ? `var(--mood-${mood})` : 'var(--border-strong)'
}

/** Average of the moods present, rounded to the nearest mood, or null if none. */
export function averageMood(moods: (Mood | null)[]): Mood | null {
  const set = moods.filter((m): m is Mood => m !== null)
  if (set.length === 0) return null
  return Math.round(set.reduce((sum, m) => sum + m, 0) / set.length) as Mood
}

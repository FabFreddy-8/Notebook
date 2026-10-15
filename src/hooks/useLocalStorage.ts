import { useCallback, useRef, useSyncExternalStore } from 'react'

/*
 * A tiny shared store over localStorage: every component using the same key
 * sees the same value and re-renders when it changes — including changes made
 * in other browser tabs.
 */

const cache = new Map<string, unknown>()
const listeners = new Map<string, Set<() => void>>()

function read<T>(key: string, initial: T): T {
  if (cache.has(key)) return cache.get(key) as T
  let value = initial
  try {
    const stored = localStorage.getItem(key)
    if (stored !== null) value = JSON.parse(stored) as T
  } catch {
    // Unreadable or unavailable storage — fall back to the initial value.
  }
  cache.set(key, value)
  return value
}

function notify(key: string) {
  listeners.get(key)?.forEach((listener) => listener())
}

function write(key: string, value: unknown) {
  cache.set(key, value)
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage unavailable (private mode, quota) — keep the in-memory value.
  }
  notify(key)
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && cache.has(e.key)) {
      cache.delete(e.key)
      notify(e.key)
    }
  })
}

export function useLocalStorage<T>(key: string, initial: T) {
  const initialRef = useRef(initial)

  const subscribe = useCallback(
    (listener: () => void) => {
      const set = listeners.get(key) ?? new Set()
      listeners.set(key, set)
      set.add(listener)
      return () => set.delete(listener)
    },
    [key],
  )

  const value = useSyncExternalStore(subscribe, () => read(key, initialRef.current))

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read(key, initialRef.current)
      write(key, typeof next === 'function' ? (next as (prev: T) => T)(prev) : next)
    },
    [key],
  )

  return [value, setValue] as const
}

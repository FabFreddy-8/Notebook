import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export type Theme = 'light' | 'dark'

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Light/dark toggle. Starts from the OS preference until the user picks one. */
export function useTheme() {
  const [stored, setStored] = useLocalStorage<Theme | 'system'>('theme', 'system')
  const theme: Theme = stored === 'light' || stored === 'dark' ? stored : systemTheme()

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggle = () => setStored(theme === 'dark' ? 'light' : 'dark')
  return [theme, toggle] as const
}

import { useTheme } from '../hooks/useTheme'
import { MoonIcon, SunIcon } from './Icons'

/** Light/dark switch. `compact` renders an icon button instead of the labelled switch. */
export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, toggle] = useTheme()
  const dark = theme === 'dark'
  const label = dark ? 'Switch to light theme' : 'Switch to dark theme'

  if (compact) {
    return (
      <button className="icon-button" onClick={toggle} aria-label={label} title={label}>
        {dark ? <SunIcon /> : <MoonIcon />}
      </button>
    )
  }

  return (
    <button className="theme-switch" role="switch" aria-checked={dark} onClick={toggle} title={label}>
      <span className="theme-switch-label">{dark ? 'Dark' : 'Light'} mode</span>
      <span className="theme-switch-track" aria-hidden="true">
        <span className="theme-switch-thumb">{dark ? <MoonIcon width={12} height={12} /> : <SunIcon width={12} height={12} />}</span>
      </span>
    </button>
  )
}

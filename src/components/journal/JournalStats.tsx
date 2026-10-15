import { useMemo, type CSSProperties } from 'react'
import { currentStreak, dayKey, lastNDays } from '../../lib/date'
import { averageMood, moodColor, moodInfo } from '../../lib/mood'
import type { Entry } from '../../types'

const TREND_DAYS = 14

/** Compact HUD: streak, weekly count, weekly mood and a 14-day mood trend. */
export default function JournalStats({ entries }: { entries: Entry[] }) {
  const stats = useMemo(() => {
    const byDay = new Map<string, Entry[]>()
    for (const e of entries) {
      const key = dayKey(e.createdAt)
      byDay.set(key, [...(byDay.get(key) ?? []), e])
    }

    const trend = lastNDays(TREND_DAYS).map((ts) => {
      const dayEntries = byDay.get(dayKey(ts)) ?? []
      return { ts, count: dayEntries.length, mood: averageMood(dayEntries.map((e) => e.mood)) }
    })
    const week = trend.slice(-7)

    return {
      streak: currentStreak(entries.map((e) => e.createdAt)),
      weekCount: week.reduce((n, d) => n + d.count, 0),
      weekMood: averageMood(week.map((d) => d.mood)),
      trend,
    }
  }, [entries])

  return (
    <section className="hud" aria-label="Journal stats">
      <div className="hud-stats">
        <div className="hud-stat">
          <span className="hud-value">{stats.streak}</span>
          <span className="hud-key">Streak</span>
        </div>
        <div className="hud-stat">
          <span className="hud-value">{stats.weekCount}</span>
          <span className="hud-key">This week</span>
        </div>
        <div className="hud-stat">
          <span className="hud-value">{stats.weekMood ? moodInfo(stats.weekMood).emoji : '—'}</span>
          <span className="hud-key">{stats.weekMood ? moodInfo(stats.weekMood).label : 'Mood'}</span>
        </div>
      </div>

      <div className="trend" aria-label={`Mood over the last ${TREND_DAYS} days`}>
        {stats.trend.map((d) => {
          const date = new Date(d.ts)
          const label = `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${
            d.mood ? moodInfo(d.mood).label : d.count ? 'no mood logged' : 'no entries'
          }`
          return (
            <span
              key={d.ts}
              className={d.mood ? 'trend-bar' : d.count ? 'trend-bar neutral' : 'trend-bar empty'}
              style={{ '--mood-color': moodColor(d.mood), '--level': d.mood ?? 1 } as CSSProperties}
              title={label}
            />
          )
        })}
      </div>
    </section>
  )
}

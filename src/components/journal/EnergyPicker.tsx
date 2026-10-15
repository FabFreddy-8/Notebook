import { ENERGY_LABELS } from '../../lib/mood'

type Props = { value: number | null; onChange: (energy: number | null) => void }

export default function EnergyPicker({ value, onChange }: Props) {
  return (
    <div className="energy">
      <div className="energy-pips" role="group" aria-label="Energy">
        {ENERGY_LABELS.map((label, i) => {
          const level = i + 1
          return (
            <button
              key={level}
              type="button"
              className={value !== null && level <= value ? 'energy-pip filled' : 'energy-pip'}
              aria-label={`Energy: ${label}`}
              aria-pressed={value === level}
              title={label}
              onClick={() => onChange(value === level ? null : level)}
            />
          )
        })}
      </div>
      <span className="energy-caption">{value ? ENERGY_LABELS[value - 1] : 'Not set'}</span>
    </div>
  )
}

/** Read-only version for entry cards. */
export function EnergyMeter({ value }: { value: number }) {
  return (
    <span className="energy-meter" title={`Energy: ${ENERGY_LABELS[value - 1]}`}>
      {ENERGY_LABELS.map((_, i) => (
        <span key={i} className={i < value ? 'filled' : undefined} />
      ))}
      <span className="energy-meter-label">{ENERGY_LABELS[value - 1]}</span>
    </span>
  )
}

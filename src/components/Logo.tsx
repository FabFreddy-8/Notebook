/** App mark: a notebook page inside an orbit ring. */
export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="logo">
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="8" fill="url(#logo-grad)" />
      <path d="M11 8.5h8.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H11Z" fill="#06110d" opacity="0.85" />
      <path d="M14 13h5M14 16.5h5M14 20h3" stroke="url(#logo-grad)" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="16" cy="16" rx="13" ry="5" fill="none" stroke="#06110d" strokeOpacity="0.35" strokeWidth="1" transform="rotate(-28 16 16)" />
    </svg>
  )
}

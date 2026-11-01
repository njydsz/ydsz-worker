interface SectionDividerProps {
  variant?: 'wave' | 'curve' | 'dots' | 'line' | 'arrow'
  flip?: boolean
  className?: string
}

export default function SectionDivider({ variant = 'wave', flip = false, className = '' }: SectionDividerProps) {
  if (variant === 'dots') {
    return (
      <div className={`flex justify-center items-center gap-1.5 py-6 ${flip ? 'rotate-180' : ''} ${className}`} aria-hidden="true">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className={`rounded-full bg-yuanbao-500/30`}
            style={{
              width: i === 4 ? '8px' : '4px',
              height: i === 4 ? '8px' : '4px',
              opacity: 0.3 + Math.abs(i - 4) * -0.03,
            }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'line') {
    return (
      <div className={`flex items-center justify-center py-4 ${className}`} aria-hidden="true">
        <div className="h-px w-full max-w-md bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    )
  }

  if (variant === 'arrow') {
    return (
      <div className={`flex justify-center py-2 ${flip ? 'rotate-180' : ''} ${className}`} aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-yuanbao-500/20">
          <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )
  }

  // wave / curve
  return (
    <svg
      className={`w-full h-12 sm:h-16 md:h-20 ${flip ? 'rotate-180' : ''} ${className}`}
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d={variant === 'curve'
          ? 'M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z'
          : 'M0,40 C360,80 720,0 1080,40 C1260,60 1380,40 1440,40 L1440,80 L0,80 Z'}
        fill="currentColor"
        className="text-ink-900"
      />
      <path
        d={variant === 'curve'
          ? 'M0,60 C240,20 480,80 720,40 C960,0 1200,60 1440,40'
          : 'M0,60 C360,20 720,80 1080,40 C1260,20 1380,40 1440,40'}
        stroke="currentColor"
        strokeWidth="1"
        className="text-yuanbao-500/[0.07]"
      />
    </svg>
  )
}

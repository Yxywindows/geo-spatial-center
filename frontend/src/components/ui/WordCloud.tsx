interface WordItem { word: string; count: number }

interface Props {
  words: WordItem[]
  onWordClick?: (word: string) => void
  activeWord?: string
}

const COLORS = [
  '#38bdf8', '#34d399', '#a78bfa', '#fbbf24',
  '#f87171', '#06b6d4', '#10b981', '#60a5fa',
  '#fb923c', '#e879f9',
]

const ROTATIONS = [-15, -10, -5, 0, 0, 0, 5, 10, 15]

export default function WordCloud({ words, onWordClick, activeWord }: Props) {
  if (words.length === 0) return null

  const max = Math.max(...words.map((w) => w.count), 1)
  const min = Math.min(...words.map((w) => w.count), 0)
  const range = max - min || 1

  return (
    <div className="gs-wc">
      {words.map((w, i) => {
        const ratio = (w.count - min) / range
        const size = Math.round(12 + ratio * 36)
        const rot = ROTATIONS[i % ROTATIONS.length]
        const color = COLORS[i % COLORS.length]
        const isActive = activeWord === w.word
        const opacity = isActive ? 1 : (0.45 + ratio * 0.55)

        return (
          <span
            key={`${i}-${w.word}`}
            className={`gs-wc__word${isActive ? ' gs-wc__word--active' : ''}`}
            title={`${w.word}：出现 ${w.count} 次`}
            style={{
              fontSize: size,
              color,
              opacity,
              transform: `rotate(${rot}deg)`,
              animationDelay: `${i * 30}ms`,
              outline: isActive ? `2px solid ${color}` : undefined,
              borderRadius: 4,
            }}
            onClick={() => onWordClick?.(w.word)}
          >
            {w.word}
          </span>
        )
      })}
    </div>
  )
}

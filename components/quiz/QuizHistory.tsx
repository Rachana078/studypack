interface QuizResult {
  id: string
  score: number
  total: number
  created_at: string
}

interface QuizHistoryProps {
  results: QuizResult[]
}

function pct(score: number, total: number) {
  return Math.round((score / total) * 100)
}

function badge(p: number) {
  if (p === 100) return { label: '🏆', color: 'text-yellow-500 bg-yellow-50 border-yellow-200' }
  if (p >= 80)   return { label: '🎉', color: 'text-green-600 bg-green-50 border-green-200' }
  if (p >= 60)   return { label: '👍', color: 'text-blue-600 bg-blue-50 border-blue-200' }
  if (p >= 40)   return { label: '📚', color: 'text-orange-500 bg-orange-50 border-orange-200' }
  return           { label: '💪', color: 'text-red-500 bg-red-50 border-red-200' }
}

export default function QuizHistory({ results }: QuizHistoryProps) {
  if (results.length === 0) return null

  return (
    <div className="mt-10">
      <h2 className="text-base font-bold text-[var(--text)] mb-4">Past Quiz Scores</h2>
      <div className="flex flex-col gap-2">
        {results.map((r, i) => {
          const p = pct(r.score, r.total)
          const { label, color } = badge(p)
          const prev = results[i + 1]
          const trend = prev ? p - pct(prev.score, prev.total) : null

          return (
            <div
              key={r.id}
              className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
            >
              {/* Emoji badge */}
              <span className={`text-sm px-2 py-0.5 rounded-full border font-medium ${color}`}>
                {label} {p}%
              </span>

              {/* Score */}
              <span className="text-sm font-semibold text-[var(--text)] tabular-nums">
                {r.score}/{r.total}
              </span>

              {/* Trend vs previous attempt */}
              {trend !== null && (
                <span className={`text-xs font-medium ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-[var(--muted)]'}`}>
                  {trend > 0 ? `↑ +${trend}%` : trend < 0 ? `↓ ${trend}%` : '→ same'}
                </span>
              )}

              {/* Date — pushed to the right */}
              <span className="ml-auto text-xs text-[var(--muted)]">
                {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

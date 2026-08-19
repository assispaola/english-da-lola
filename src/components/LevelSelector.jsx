import { Lock } from 'lucide-react'
import { LEVELS, useLevel, getRoadmapCompletion } from '../utils/levels'

// Switches which CEFR level's content (roadmap, exercícios, flashcards,
// glossário, XP, badges) is shown across the app. Locked levels stay visible
// (never hidden) with a lock icon and a "how much is left" tooltip — they
// unlock automatically once the previous level's roadmap hits 100% in every
// category. `compact` is used in the sidebar (tight width); the default
// layout is used at the top of the dashboard.
export default function LevelSelector({ compact = false, activeColor = '#E91E8C' }) {
  const { currentLevel, setCurrentLevel, unlockedLevels } = useLevel()

  return (
    <div className={compact ? 'grid grid-cols-3 gap-1.5' : 'flex gap-2 flex-wrap'}>
      {LEVELS.map((lvl, i) => {
        const active = lvl === currentLevel
        const unlocked = unlockedLevels.includes(lvl)
        const prevLevel = LEVELS[i - 1]
        const missingPct = !unlocked && prevLevel ? Math.max(0, 100 - getRoadmapCompletion(prevLevel).pct) : 0

        return (
          <button key={lvl}
            onClick={() => unlocked && setCurrentLevel(lvl)}
            disabled={!unlocked}
            title={unlocked ? undefined : `faltam ${missingPct}% em ${prevLevel} para liberar ${lvl}`}
            className={`font-body font-bold transition-all inline-flex items-center justify-center gap-1 ${compact ? 'py-1 text-xs' : 'px-3 py-1.5 text-sm'}`}
            style={{
              borderRadius: compact ? '6px' : '8px',
              backgroundColor: active ? activeColor : '#F3F4F6',
              color: active ? 'white' : unlocked ? '#6B7280' : '#B0B7C3',
              cursor: unlocked ? 'pointer' : 'not-allowed',
            }}>
            {!unlocked && <Lock size={compact ? 9 : 11} />}
            {lvl}
          </button>
        )
      })}
    </div>
  )
}

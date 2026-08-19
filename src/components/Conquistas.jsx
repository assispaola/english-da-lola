import { Flame, Zap } from 'lucide-react'
import { getExerciseStreak, getTotalXP, getLevelInfo, getBadges } from '../utils/gamification'
import { useLevel } from '../utils/levels'
import { PAGE_COLORS } from '../utils/colors'

const pc = PAGE_COLORS.conquistas

export default function Conquistas() {
  const { currentLevel } = useLevel()
  const streak = getExerciseStreak() // cross-level on purpose — studying any level counts
  const xp     = getTotalXP(currentLevel)
  const badges = getBadges(currentLevel)
  const { level, xpIntoLevel, xpForNext, pct } = getLevelInfo(xp)

  return (
    <div className="max-w-2xl">
      {/* Streak + XP */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="card p-5 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-2" style={{ backgroundColor: '#FFF3E0' }}>
            <Flame size={22} style={{ color: '#FF6B35' }} />
          </div>
          <div className="font-heading text-3xl" style={{ color: '#FF6B35', fontWeight: 700 }}>{streak}</div>
          <p className="font-body text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{streak === 1 ? 'dia seguido' : 'dias seguidos'} praticando</p>
        </div>
        <div className="card p-5 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-2" style={{ backgroundColor: '#FEF3C7' }}>
            <Zap size={22} style={{ color: '#D97706' }} />
          </div>
          <div className="font-heading text-3xl" style={{ color: '#D97706', fontWeight: 700 }}>{xp}</div>
          <p className="font-body text-xs mt-0.5" style={{ color: '#9CA3AF' }}>XP em {currentLevel}</p>
        </div>
      </div>

      {/* Level bar */}
      <div className="card p-5 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-heading text-lg lowercase" style={{ color: '#D97706', fontWeight: 500 }}>nível {level}</span>
          <span className="font-body text-xs" style={{ color: '#9CA3AF' }}>{xpIntoLevel} / {xpForNext} xp</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%`, background: 'linear-gradient(to right, #FBBF24, #D97706)' }} />
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-heading text-lg lowercase" style={{ color: pc.primary, fontWeight: 500 }}>badges</h3>
        <span className="pill" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>{currentLevel}</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {badges.map(badge => (
          <div key={badge.id} className="card p-4 text-center" style={{ opacity: badge.unlocked ? 1 : 0.45 }}>
            <div className="text-4xl mb-2" aria-hidden>{badge.unlocked ? badge.icon : '🔒'}</div>
            <p className="font-body text-xs font-semibold leading-tight" style={{ color: badge.unlocked ? '#1A1A2E' : '#9CA3AF' }}>
              {badge.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

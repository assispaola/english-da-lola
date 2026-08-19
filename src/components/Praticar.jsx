import { useState, useEffect, useMemo } from 'react'
import { Zap, ChevronRight, CheckCircle2 } from 'lucide-react'
import { getRoadmapForLevel } from '../data/roadmapData'
import { getAllExercisesForLevel } from '../data/exerciseBank'
import { getExercisesByTopic, seedExercisesFromBank } from '../utils/exercises'
import { getAttemptsByExercise } from '../utils/attempts'
import { buildReviewPool } from '../utils/reviewQueue'
import { useLevel } from '../utils/levels'
import { PAGE_COLORS } from '../utils/colors'
import ExercisePlayer from './ExercisePlayer'

const pc = PAGE_COLORS.praticar
const CATEGORIES = ['Gramática', 'Vocabulário', 'Leitura', 'Fala']

export default function Praticar() {
  const { currentLevel, checkUnlocks } = useLevel()
  const [seedTick,  setSeedTick]  = useState(0)
  const [playing,   setPlaying]   = useState(null) // { title, exercises } | null

  useEffect(() => {
    seedExercisesFromBank(getAllExercisesForLevel(currentLevel))
    setSeedTick(t => t + 1)
  }, [currentLevel])

  const topicsByCategory = useMemo(() => {
    const roadmap = getRoadmapForLevel(currentLevel)
    return CATEGORIES.map(category => {
      const items = (roadmap[category] || [])
        .map(item => {
          const exs  = getExercisesByTopic(item.id, currentLevel)
          const done = exs.filter(ex => getAttemptsByExercise(ex.id).length > 0).length
          return { id: item.id, title: item.title, total: exs.length, done }
        })
        .filter(t => t.total > 0)
      return { category, items }
    }).filter(c => c.items.length > 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedTick, currentLevel])

  const quickReviewPool = useMemo(() => buildReviewPool({ level: currentLevel }), [seedTick, currentLevel])

  const openTopic = (topic) => {
    setPlaying({ title: topic.title, exercises: getExercisesByTopic(topic.id, currentLevel) })
  }

  const openQuickReview = () => {
    if (!quickReviewPool.length) return
    setPlaying({ title: 'revisão rápida', exercises: quickReviewPool })
  }

  const exitPlayer = () => {
    setPlaying(null)
    setSeedTick(t => t + 1) // refresh done-counts / review pool after playing
    checkUnlocks() // practicing can complete a topic, which can complete the level
  }

  if (playing) {
    return (
      <div>
        <div className="max-w-lg mx-auto mb-4">
          <p className="font-heading text-lg lowercase" style={{ color: pc.primary, fontWeight: 700 }}>{playing.title}</p>
        </div>
        <ExercisePlayer exercises={playing.exercises} onExit={exitPlayer} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      {/* Revisão rápida */}
      <button onClick={openQuickReview} disabled={!quickReviewPool.length}
        className="w-full flex items-center gap-4 p-5 mb-6 transition-all"
        style={{
          borderRadius: '16px',
          background: quickReviewPool.length ? `linear-gradient(135deg, ${pc.primary} 0%, ${pc.secondary} 100%)` : '#F3F4F6',
          cursor: quickReviewPool.length ? 'pointer' : 'not-allowed',
          boxShadow: quickReviewPool.length ? '0 4px 14px rgba(0,0,0,0.15)' : 'none',
        }}
        onMouseEnter={e => { if (quickReviewPool.length) e.currentTarget.style.transform = 'scale(1.01)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
        <div className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
          style={{ backgroundColor: quickReviewPool.length ? 'rgba(255,255,255,0.25)' : '#E5E7EB' }}>
          <Zap size={20} color={quickReviewPool.length ? 'white' : '#9CA3AF'} />
        </div>
        <div className="flex-1 text-left">
          <p className="font-heading text-lg lowercase" style={{ color: quickReviewPool.length ? 'white' : '#9CA3AF', fontWeight: 700 }}>
            revisão rápida
          </p>
          <p className="font-body text-sm" style={{ color: quickReviewPool.length ? 'rgba(255,255,255,0.85)' : '#9CA3AF' }}>
            {quickReviewPool.length
              ? `${quickReviewPool.length} exercícios dos tópicos com mais erros`
              : 'ainda sem erros registrados — pratique um tópico para começar'}
          </p>
        </div>
        {quickReviewPool.length > 0 && <ChevronRight size={20} color="white" className="flex-shrink-0" />}
      </button>

      {/* Topic list, grouped by roadmap category */}
      {topicsByCategory.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <p className="font-heading text-xl lowercase" style={{ color: '#D1D5DB', fontWeight: 500 }}>nenhum exercício disponível em {currentLevel} ainda</p>
        </div>
      ) : (
        topicsByCategory.map(({ category, items }) => (
          <div key={category} className="mb-7">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-heading text-xs font-bold uppercase tracking-widest lowercase"
                style={{ color: pc.primary, letterSpacing: '0.08em' }}>
                {category}
              </span>
              <div className="flex-1 h-px" style={{ backgroundColor: pc.border }} />
            </div>

            <div className="space-y-2.5">
              {items.map(topic => {
                const pct = topic.total > 0 ? Math.round((topic.done / topic.total) * 100) : 0
                const complete = topic.done === topic.total
                return (
                  <button key={topic.id} onClick={() => openTopic(topic)}
                    className="w-full text-left card-flat p-4 transition-all hover:scale-[1.01] flex items-center gap-4"
                    style={{ borderColor: pc.border }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-body text-sm font-semibold truncate" style={{ color: '#1A1A2E' }}>{topic.title}</p>
                        {complete && <CheckCircle2 size={14} style={{ color: '#26C6A0' }} className="flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="progress-track flex-1" style={{ height: '6px' }}>
                          <div className="progress-fill" style={{
                            width: `${pct}%`,
                            background: `linear-gradient(to right, ${pc.primary}, ${pc.secondary})`,
                          }} />
                        </div>
                        <span className="text-xs font-body flex-shrink-0" style={{ color: '#9CA3AF' }}>
                          {topic.done}/{topic.total}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="flex-shrink-0" style={{ color: pc.primary }} />
                  </button>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

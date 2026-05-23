import { useState, useEffect } from 'react'
import { Plus, Check, X } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const DEFAULT_GOALS = [
  { id: 'd1', text: 'Revisar 10 flashcards',             isDefault: true, done: false },
  { id: 'd2', text: 'Escrever 1 entrada no diário',       isDefault: true, done: false },
  { id: 'd3', text: 'Marcar 2 tópicos no roadmap',        isDefault: true, done: false },
  { id: 'd4', text: 'Adicionar 5 palavras ao glossário',  isDefault: true, done: false },
]

function getMonday(date) {
  const d   = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(new Date(date).setDate(diff)).toISOString().split('T')[0]
}

export default function MetasSemanais() {
  const currentMonday = getMonday(new Date())

  const [metas, setMetas] = useLocalStorage('ej_metas', {
    weekStart: currentMonday,
    goals: DEFAULT_GOALS,
  })
  const [newGoalText, setNewGoalText] = useState('')

  // Auto-reset on new week
  useEffect(() => {
    setMetas(prev => {
      if (prev.weekStart !== currentMonday) {
        return { weekStart: currentMonday, goals: prev.goals.map(g => ({ ...g, done: false })) }
      }
      return prev
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleGoal = (id) => setMetas({ ...metas, goals: metas.goals.map(g => g.id === id ? { ...g, done: !g.done } : g) })
  const deleteGoal = (id) => setMetas({ ...metas, goals: metas.goals.filter(g => g.id !== id) })
  const addGoal = () => {
    if (!newGoalText.trim()) return
    setMetas({ ...metas, goals: [...metas.goals, { id: `c-${Date.now()}`, text: newGoalText, isDefault: false, done: false }] })
    setNewGoalText('')
  }

  const done  = metas.goals.filter(g => g.done).length
  const total = metas.goals.length
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0

  const weekEnd = new Date(currentMonday + 'T12:00:00')
  weekEnd.setDate(weekEnd.getDate() + 6)

  const fmtShort = (d) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day:'numeric', month:'long' })

  return (
    <div className="max-w-2xl">
      {/* Week summary */}
      <div className="card p-5 md:p-6 mb-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-heading text-xl lowercase" style={{ color:'#C2185B', fontWeight:500 }}>current week 🎯</h3>
            <p className="font-body text-sm" style={{ color:'#9CA3AF' }}>
              {fmtShort(currentMonday)} — {weekEnd.toLocaleDateString('pt-BR',{ day:'numeric', month:'long', year:'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <div className="font-heading text-3xl" style={{ color:'#E91E8C' }}>{done}/{total}</div>
            <p className="text-xs font-body" style={{ color:'#9CA3AF' }}>concluídas</p>
          </div>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width:`${pct}%` }} />
        </div>
        <p className="text-xs font-body text-right mt-1" style={{ color:'#9CA3AF' }}>{pct}% completo</p>
      </div>

      {/* Goals list */}
      <div className="space-y-2 mb-5">
        {metas.goals.map(goal => (
          <div key={goal.id}
            className="rounded-2xl p-4 border-[1.5px] transition-all hover:scale-[1.01] group"
            style={goal.done
              ? { backgroundColor:'#E0F7FA', borderColor:'#80DEEA' }
              : { backgroundColor:'white', borderColor:'#F8BBD0', boxShadow:'0 2px 8px rgba(233,30,140,0.06)' }}>
            <div className="flex items-center gap-3">
              <button onClick={() => toggleGoal(goal.id)}
                className="w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all cursor-pointer"
                style={goal.done
                  ? { backgroundColor:'#26C6A0', borderColor:'#26C6A0', color:'white', transform:'scale(1.1)' }
                  : { borderColor:'#F8BBD0', backgroundColor:'white' }}>
                {goal.done && <Check size={14} />}
              </button>
              <span className={`font-body flex-1 text-sm ${goal.done ? 'line-through' : ''}`}
                style={{ color: goal.done ? '#9CA3AF' : '#1A1A2E' }}>
                {goal.text}
              </span>
              <div className="flex items-center gap-1">
                {goal.isDefault && (
                  <span className="text-xs font-body" style={{ color:'#D1D5DB' }}>sugerida</span>
                )}
                {!goal.isDefault && (
                  <button onClick={() => deleteGoal(goal.id)}
                    className="opacity-0 group-hover:opacity-100 btn-icon danger transition-opacity" style={{ minWidth:'28px', minHeight:'28px' }}>
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add custom goal */}
      <div className="card-flat p-4 mb-5">
        <h4 className="font-heading text-base mb-3 lowercase" style={{ color:'#C2185B', fontWeight:500 }}>+ custom goal</h4>
        <div className="flex gap-2">
          <input type="text" value={newGoalText} onChange={e => setNewGoalText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addGoal()}
            placeholder="ex: Assistir 1 episódio de série em inglês…"
            className="input-field flex-1" />
          <button onClick={addGoal} className="btn-primary flex-shrink-0"><Plus size={16} /> adicionar</button>
        </div>
      </div>

      {/* Celebration */}
      {pct === 100 && (
        <div className="rounded-2xl p-6 text-center text-white shadow-lg"
          style={{ background:'linear-gradient(135deg,#26C6A0,#00897B)' }}>
          <div className="text-5xl mb-2">🏆</div>
          <p className="font-heading text-2xl lowercase" style={{ color:'white', fontWeight:700 }}>all goals completed!</p>
          <p className="font-body text-sm mt-1" style={{ color:'rgba(255,255,255,0.8)' }}>incrível! você arrasou essa semana! 💪</p>
        </div>
      )}
    </div>
  )
}

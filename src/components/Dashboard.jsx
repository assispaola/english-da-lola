import { useState, useEffect } from 'react'
import { Flame, Layers, CheckCircle, Download } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getStreak } from '../utils/activity'
import { ROADMAP_INITIAL } from '../data/roadmapData'
import { exportBackup } from '../utils/backup'
import { PAGE_COLORS } from '../utils/colors'
import ExportReport from './ExportReport'
import WavyBackground from './WavyBackground'

function ProgressBar({ value, color }) {
  return (
    <div className="overflow-hidden" style={{ height: '10px', borderRadius: '50px', backgroundColor: '#E5E7EB' }}>
      <div style={{
        height: '100%', borderRadius: '50px',
        width: `${value}%`,
        background: color ? `linear-gradient(to right, ${color}, ${color}cc)` : 'linear-gradient(to right, #E91E8C, #C2185B)',
        transition: 'width 0.6s ease',
      }} />
    </div>
  )
}

export default function Dashboard({ setActivePage }) {
  const [nextClass, setNextClass] = useLocalStorage('ej_next_class', { date: '', topic: '', type: 'VIP' })
  const [streak,          setStreak]         = useState(0)
  const [roadmapProgress, setRoadmapProgress] = useState(0)
  const [roadmapDone,     setRoadmapDone]     = useState(0)
  const [roadmapTotal,    setRoadmapTotal]    = useState(0)
  const [reviewsToday,    setReviewsToday]    = useState(0)
  const [roadmapToday,    setRoadmapToday]    = useState(0)

  const today = new Date().toISOString().split('T')[0]
  const pc    = PAGE_COLORS.dashboard

  useEffect(() => {
    setStreak(getStreak())

    const rm = (() => { try { return JSON.parse(localStorage.getItem('ej_roadmap') || 'null') || ROADMAP_INITIAL } catch { return ROADMAP_INITIAL } })()
    let total = 0, done = 0, todayDone = 0
    Object.values(rm).forEach(items => items.forEach(item => {
      total++
      if (item.status === 'Concluído') { done++; if (item.completedAt === today) todayDone++ }
    }))
    setRoadmapTotal(total); setRoadmapDone(done)
    setRoadmapProgress(total > 0 ? Math.round((done / total) * 100) : 0)
    setRoadmapToday(todayDone)

    const fc = (() => { try { return JSON.parse(localStorage.getItem('ej_flashcards') || '[]') } catch { return [] } })()
    setReviewsToday(fc.filter(f => f.lastReview === today).length)
  }, [today])

  const daysUntil = nextClass.date
    ? Math.ceil((new Date(nextClass.date + 'T12:00:00') - new Date()) / 86400000) : null

  const quickLinks = [
    { id: 'flashcards', label: 'Revisar Cards',  pc: PAGE_COLORS.flashcards },
    { id: 'roadmap',    label: 'Ver Roadmap',    pc: PAGE_COLORS.roadmap    },
    { id: 'diario',     label: 'Escrever',        pc: PAGE_COLORS.diario     },
    { id: 'vip',        label: 'Prep VIP',        pc: PAGE_COLORS.vip        },
  ]

  return (
    <div className="space-y-5 max-w-4xl">

      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, #6BC7BC 0%, #AFD795 100%)` }}>
        <WavyBackground color1="rgba(255,255,255,0.10)" color2="rgba(255,255,255,0.06)" />
        <div className="relative z-10">
          <h2 className="font-heading text-2xl mb-1 lowercase" style={{ color: 'white', fontWeight: 700 }}>
            let's study today! 💪
          </h2>
          <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <div className="mt-4 flex gap-2 flex-wrap">
            <ExportReport />
            <button
              onClick={exportBackup}
              className="inline-flex items-center gap-2 font-body font-semibold text-sm px-4 py-2 transition-all"
              style={{ backgroundColor: 'rgba(255,255,255,0.20)', color: 'white', borderRadius: '8px', border: '1.5px solid rgba(255,255,255,0.35)', minHeight: '40px' }}>
              <Download size={14} /> backup
            </button>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="card p-5 md:p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-heading text-lg md:text-xl lowercase" style={{ color: pc.secondary, fontWeight: 500 }}>
            overall progress — a1
          </h3>
          <span className="font-heading text-2xl" style={{ color: pc.primary }}>{roadmapProgress}%</span>
        </div>
        <ProgressBar value={roadmapProgress} color={pc.primary} />
        <p className="text-xs font-body mt-2" style={{ color: '#9CA3AF' }}>
          {roadmapDone} de {roadmapTotal} tópicos concluídos
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {[
          { Icon: Flame,       value: streak,       label: streak === 1 ? 'dia seguido' : 'dias seguidos', pc: PAGE_COLORS.diario  },
          { Icon: Layers,      value: reviewsToday, label: 'flashcards hoje',  pc: PAGE_COLORS.flashcards },
          { Icon: CheckCircle, value: roadmapToday, label: 'tópicos hoje',     pc: PAGE_COLORS.metas      },
        ].map((s, i) => (
          <div key={i} className="card p-4 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-2"
              style={{ backgroundColor: s.pc.accent }}>
              <s.Icon size={20} style={{ color: s.pc.primary }} />
            </div>
            <div className="font-heading text-3xl" style={{ color: '#FD3766', fontWeight: 700 }}>{s.value}</div>
            <p className="font-body text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Next class */}
      <div className="card p-5 md:p-6">
        <h3 className="font-heading text-xl mb-4 lowercase" style={{ color: pc.secondary, fontWeight: 500 }}>
          next class 📅
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {[
            { label: 'data',   children: <input type="date" value={nextClass.date} onChange={e => setNextClass({ ...nextClass, date: e.target.value })} className="input-field" /> },
            { label: 'tópico', children: <input type="text" value={nextClass.topic} onChange={e => setNextClass({ ...nextClass, topic: e.target.value })} placeholder="ex: Present Continuous…" className="input-field" /> },
            { label: 'tipo',   children: (
              <select value={nextClass.type} onChange={e => setNextClass({ ...nextClass, type: e.target.value })} className="input-field">
                <option value="VIP">VIP</option><option value="Grupo">Grupo</option>
              </select>
            )},
          ].map(({ label, children }) => (
            <div key={label}>
              <label className="block text-xs font-body mb-1" style={{ color: '#9CA3AF' }}>{label}</label>
              {children}
            </div>
          ))}
        </div>
        {nextClass.date && (
          <div className="rounded-xl p-3 font-body text-sm" style={{ backgroundColor: pc.accent, border: `1.5px solid ${pc.border}` }}>
            <strong style={{ color: pc.primary }}>{nextClass.type}</strong>
            {' — '}{nextClass.topic || 'sem tópico'}
            {daysUntil !== null && (
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: pc.border, color: pc.text }}>
                {daysUntil <= 0 ? 'hoje!' : daysUntil === 1 ? 'amanhã!' : `em ${daysUntil} dias`}
              </span>
            )}
            <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
              {new Date(nextClass.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickLinks.map(link => (
          <button key={link.id} onClick={() => setActivePage(link.id)}
            className="rounded-xl p-4 text-center font-body font-semibold text-sm transition-all hover:scale-[1.03] shadow-sm"
            style={{ backgroundColor: link.pc.accent, color: link.pc.primary, border: `2px solid ${link.pc.border}` }}>
            {link.label}
          </button>
        ))}
      </div>
    </div>
  )
}

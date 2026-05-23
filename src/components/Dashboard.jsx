import { useState, useEffect } from 'react'
import { Flame, Layers, CheckCircle } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getStreak } from '../utils/activity'
import { ROADMAP_INITIAL } from '../data/roadmapData'
import ExportReport from './ExportReport'

function ProgressBar({ value }) {
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${value}%` }} />
    </div>
  )
}

/* Subtle pink blob SVG decoration */
function BlobDecor({ className }) {
  return (
    <svg className={`absolute pointer-events-none select-none ${className}`}
      viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M44,-65C55,-52,61,-36,67,-19C73,-2,79,15,76,31C73,47,60,62,45,72C29,82,10,86,-8,82C-25,78,-40,67,-53,53C-66,39,-76,22,-77,4C-78,-14,-70,-33,-58,-48C-45,-63,-28,-74,-10,-73C8,-72,33,-78,44,-65Z"
        fill="white" />
    </svg>
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
    { id: 'flashcards', label: 'Revisar Cards',  color: '#E91E8C', bg: '#FCE4EC' },
    { id: 'roadmap',    label: 'Ver Roadmap',    color: '#C2185B', bg: '#FCE4EC' },
    { id: 'diario',     label: 'Escrever',        color: '#FF6B35', bg: '#FFF3E0' },
    { id: 'vip',        label: 'Prep VIP',        color: '#26C6A0', bg: '#E0F7FA' },
  ]

  return (
    <div className="space-y-5 max-w-4xl">

      {/* Welcome banner with blobs */}
      <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg, #E91E8C 0%, #C2185B 100%)' }}>
        <BlobDecor className="opacity-15 w-48 h-48 -top-10 -right-10" />
        <BlobDecor className="opacity-10 w-32 h-32 -bottom-8 -left-8 rotate-180" />
        <div className="relative z-10">
          <h2 className="font-heading text-2xl mb-1 lowercase" style={{ color:'white', fontWeight:700 }}>
            let's study today! 💪
          </h2>
          <p className="font-body text-pink-100 text-sm">
            {new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </p>
          <div className="mt-4">
            <ExportReport />
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="card p-5 md:p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-heading text-lg md:text-xl lowercase" style={{ color:'#C2185B', fontWeight:500 }}>
            overall progress — a1
          </h3>
          <span className="font-heading text-2xl" style={{ color:'#E91E8C' }}>{roadmapProgress}%</span>
        </div>
        <ProgressBar value={roadmapProgress} />
        <p className="text-xs font-body mt-2" style={{ color:'#9CA3AF' }}>
          {roadmapDone} de {roadmapTotal} tópicos concluídos
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {[
          { Icon: Flame,       value: streak,       label: streak === 1 ? 'dia seguido' : 'dias seguidos', iconColor:'#FF6B35', bg:'#FFF3E0' },
          { Icon: Layers,      value: reviewsToday, label: 'flashcards hoje',  iconColor:'#E91E8C', bg:'#FCE4EC' },
          { Icon: CheckCircle, value: roadmapToday, label: 'tópicos hoje',     iconColor:'#26C6A0', bg:'#E0F7FA' },
        ].map((s, i) => (
          <div key={i} className="card p-4 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-2"
              style={{ backgroundColor: s.bg }}>
              <s.Icon size={20} style={{ color: s.iconColor }} />
            </div>
            <div className="font-heading text-3xl" style={{ color: s.iconColor }}>{s.value}</div>
            <p className="font-body text-xs mt-0.5" style={{ color:'#9CA3AF' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Next class */}
      <div className="card p-5 md:p-6">
        <h3 className="font-heading text-xl mb-4 lowercase" style={{ color:'#C2185B', fontWeight:500 }}>
          next class 📅
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {[
            { label:'data',   children: <input type="date" value={nextClass.date} onChange={e=>setNextClass({...nextClass,date:e.target.value})} className="input-field" /> },
            { label:'tópico', children: <input type="text" value={nextClass.topic} onChange={e=>setNextClass({...nextClass,topic:e.target.value})} placeholder="ex: Present Continuous…" className="input-field" /> },
            { label:'tipo',   children: (
              <select value={nextClass.type} onChange={e=>setNextClass({...nextClass,type:e.target.value})} className="input-field">
                <option value="VIP">VIP</option><option value="Grupo">Grupo</option>
              </select>
            )},
          ].map(({ label, children }) => (
            <div key={label}>
              <label className="block text-xs font-body mb-1" style={{ color:'#9CA3AF' }}>{label}</label>
              {children}
            </div>
          ))}
        </div>
        {nextClass.date && (
          <div className="rounded-xl p-3 font-body text-sm" style={{ backgroundColor:'#FFF0F6', border:'1.5px solid #F8BBD0' }}>
            <strong style={{ color:'#E91E8C' }}>{nextClass.type}</strong>
            {' — '}{nextClass.topic || 'sem tópico'}
            {daysUntil !== null && (
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor:'#FCE4EC', color:'#C2185B' }}>
                {daysUntil <= 0 ? 'hoje!' : daysUntil === 1 ? 'amanhã!' : `em ${daysUntil} dias`}
              </span>
            )}
            <p className="text-xs mt-0.5" style={{ color:'#9CA3AF' }}>
              {new Date(nextClass.date + 'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
            </p>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickLinks.map(link => (
          <button key={link.id} onClick={() => setActivePage(link.id)}
            className="rounded-2xl p-4 text-center font-body font-bold text-sm transition-all hover:scale-[1.03] shadow-sm"
            style={{ backgroundColor: link.bg, color: link.color, border: `1.5px solid ${link.color}22` }}>
            {link.label}
          </button>
        ))}
      </div>
    </div>
  )
}

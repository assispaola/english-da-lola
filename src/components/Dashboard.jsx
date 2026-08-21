import { useState, useEffect, useMemo } from 'react'
import { useRef } from 'react'
import { Flame, Layers, CheckCircle, Download, Upload, Zap, Lightbulb, ChevronRight, Info } from 'lucide-react'
import { getExerciseStreak, getTotalXP, getLevelInfo } from '../utils/gamification'
import { getVipSuggestions } from '../utils/reviewQueue'
import { getRoadmapForLevel } from '../data/roadmapData'
import { useLevel, DEFAULT_LEVEL } from '../utils/levels'
import { exportBackup, importBackup } from '../utils/backup'
import { getUpcomingClasses } from '../utils/classes'
import { alertDialog } from '../utils/confirmDialog'
import { PAGE_COLORS } from '../utils/colors'
import ExportReport from './ExportReport'
import WavyBackground from './WavyBackground'
import LevelSelector from './LevelSelector'
import ClassesCard from './ClassesCard'

const SKILL_CATEGORIES = ['Gramática', 'Vocabulário', 'Leitura', 'Fala']
const SKILL_COLORS = {
  'Gramática':   '#C2185B',
  'Vocabulário': '#FF6B35',
  'Leitura':     '#26C6A0',
  'Fala':        '#7C3AED',
}

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

// Monday (YYYY-MM-DD) of the week containing the given date string.
function getMonday(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay()
  d.setDate(d.getDate() - ((day + 6) % 7))
  return d.toISOString().split('T')[0]
}

// Cumulative % of each skill category completed (by roadmap status' completedAt),
// sampled at the end of each of the last 8 weeks — the historical trend.
function computeSkillTrend(rm) {
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (7 - i) * 7)
    const monday = getMonday(d.toISOString().split('T')[0])
    const sunday = new Date(monday + 'T12:00:00')
    sunday.setDate(sunday.getDate() + 6)
    return {
      cutoff: sunday.toISOString().split('T')[0],
      label: new Date(monday + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    }
  })

  const series = SKILL_CATEGORIES.map(cat => {
    const items = rm[cat] || []
    const total = items.length
    const values = weeks.map(w => {
      if (!total) return 0
      const done = items.filter(i => i.completedAt && i.completedAt <= w.cutoff).length
      return Math.round((done / total) * 100)
    })
    return { category: cat, color: SKILL_COLORS[cat], values, current: values[values.length - 1] || 0 }
  })

  return { weeks, series }
}

function SkillLineChart({ weeks, series }) {
  const width = 300, height = 90, padX = 6, padY = 8
  const stepX = weeks.length > 1 ? (width - padX * 2) / (weeks.length - 1) : 0
  const toX = (i) => padX + i * stepX
  const toY = (v) => height - padY - (v / 100) * (height - padY * 2)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height: '100px' }}
      role="img" aria-label="Progresso por skill nas últimas semanas">
      <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="#F3F4F6" strokeWidth="1" />
      {series.map(s => (
        <polyline key={s.category} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          points={s.values.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')} />
      ))}
      {series.map(s => (
        <circle key={`${s.category}-dot`} cx={toX(s.values.length - 1)} cy={toY(s.values[s.values.length - 1])} r="3" fill={s.color} />
      ))}
    </svg>
  )
}

export default function Dashboard({ setActivePage }) {
  const { currentLevel } = useLevel()
  const fileInputRef = useRef(null)
  const [streak,          setStreak]         = useState(0)
  const [xpTotal,         setXpTotal]        = useState(0)
  const [levelInfo,       setLevelInfo]      = useState({ level: 1, xpIntoLevel: 0, xpForNext: 100, pct: 0 })
  const [roadmapProgress, setRoadmapProgress] = useState(0)
  const [roadmapDone,     setRoadmapDone]     = useState(0)
  const [roadmapTotal,    setRoadmapTotal]    = useState(0)
  const [reviewsToday,    setReviewsToday]    = useState(0)
  const [topicsThisWeek,  setTopicsThisWeek]  = useState(0)
  const [skillTrend,      setSkillTrend]      = useState({ weeks: [], series: [] })
  const [vipSuggestions,  setVipSuggestions]  = useState([])

  const today = new Date().toISOString().split('T')[0]
  const pc    = PAGE_COLORS.dashboard

  useEffect(() => {
    setStreak(getExerciseStreak()) // cross-level: studying in any level keeps it alive
    const xp = getTotalXP(currentLevel)
    setXpTotal(xp)
    setLevelInfo(getLevelInfo(xp))
    setVipSuggestions(getVipSuggestions(currentLevel, 3))

    const roadmapKey = `ej_roadmap__${currentLevel}`
    const rmDefault = getRoadmapForLevel(currentLevel)
    const rm = (() => { try { return JSON.parse(localStorage.getItem(roadmapKey) || 'null') || rmDefault } catch { return rmDefault } })()
    const weekStart = getMonday(today)
    let total = 0, done = 0, weekDone = 0
    Object.values(rm).forEach(items => items.forEach(item => {
      total++
      if (item.status === 'Concluído') {
        done++
        if (item.completedAt && item.completedAt >= weekStart) weekDone++
      }
    }))
    setRoadmapTotal(total); setRoadmapDone(done)
    setRoadmapProgress(total > 0 ? Math.round((done / total) * 100) : 0)
    setTopicsThisWeek(weekDone)
    setSkillTrend(computeSkillTrend(rm))

    const fc = (() => { try { return JSON.parse(localStorage.getItem('ej_flashcards') || '[]') } catch { return [] } })()
    setReviewsToday(fc.filter(f => (f.level || DEFAULT_LEVEL) === currentLevel && f.lastReview === today).length)
  }, [today, currentLevel])

  const [classesTick, setClassesTick] = useState(0)
  const nextVipClass = useMemo(() => getUpcomingClasses(today).find(c => c.type === 'VIP'), [today, classesTick])

  const quickLinks = [
    { id: 'flashcards', label: 'Revisar Cards',  pc: PAGE_COLORS.flashcards },
    { id: 'roadmap',    label: 'Ver Roadmap',    pc: PAGE_COLORS.roadmap    },
    { id: 'diario',     label: 'Escrever',        pc: PAGE_COLORS.diario     },
    { id: 'vip',        label: 'Prep VIP',        pc: PAGE_COLORS.vip        },
  ]

  return (
    <div className="space-y-5 max-w-4xl">

      {/* Level selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-body uppercase tracking-wide flex-shrink-0" style={{ color: '#9CA3AF' }}>nível</span>
        <LevelSelector activeColor={pc.primary} />
      </div>

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
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                try {
                  await importBackup(file)
                  await alertDialog('Backup restaurado com sucesso! A página vai recarregar.', { variant: 'success' })
                  window.location.reload()
                } catch {
                  await alertDialog('Erro ao restaurar o backup. Verifique se o arquivo é válido.', { variant: 'danger' })
                }
                e.target.value = ''
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 font-body font-semibold text-sm px-4 py-2 transition-all"
              style={{ backgroundColor: 'rgba(255,255,255,0.20)', color: 'white', borderRadius: '8px', border: '1.5px solid rgba(255,255,255,0.35)', minHeight: '40px' }}>
              <Upload size={14} /> restaurar
            </button>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="card p-5 md:p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-heading text-lg md:text-xl lowercase" style={{ color: pc.secondary, fontWeight: 500 }}>
            overall progress — <span style={{ textTransform: 'uppercase' }}>{currentLevel}</span>
          </h3>
          <span className="font-heading text-2xl" style={{ color: pc.primary }}>{roadmapProgress}%</span>
        </div>
        <ProgressBar value={roadmapProgress} color={pc.primary} />
        <p className="text-xs font-body mt-2" style={{ color: '#9CA3AF' }}>
          {roadmapDone} de {roadmapTotal} tópicos concluídos
        </p>
      </div>

      {/* Resumo rápido */}
      <div>
        <p className="text-xs font-body uppercase tracking-wide mb-2 px-1" style={{ color: '#9CA3AF' }}>resumo rápido</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { Icon: Flame,       value: streak,         label: streak === 1 ? 'dia seguido' : 'dias seguidos', pc: PAGE_COLORS.diario  },
            { Icon: Zap,         value: xpTotal,        label: 'xp total',                pc: PAGE_COLORS.conquistas },
            { Icon: CheckCircle, value: topicsThisWeek, label: 'tópicos esta semana',      pc: PAGE_COLORS.metas      },
            { Icon: Layers,      value: reviewsToday,   label: 'flashcards hoje',          pc: PAGE_COLORS.flashcards },
          ].map((s, i) => (
            <div key={i} className="card p-4 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-2"
                style={{ backgroundColor: s.pc.accent }}>
                <s.Icon size={20} style={{ color: '#e91e63' }} />
              </div>
              <div className="font-heading text-3xl" style={{ color: '#673ab7', fontWeight: 500 }}>{s.value}</div>
              <p className="font-body text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* XP / level — discreet single-row bar, gamification stays a reinforcement, not the focus */}
      <div className="card px-5 py-3 flex items-center gap-3">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Zap size={15} style={{ color: '#D97706' }} />
          <span className="font-body text-xs font-semibold" style={{ color: '#D97706' }}>nível {levelInfo.level}</span>
        </div>
        <div className="progress-track flex-1" style={{ height: '6px' }}>
          <div className="progress-fill" style={{ width: `${levelInfo.pct}%`, background: 'linear-gradient(to right, #FBBF24, #D97706)' }} />
        </div>
        <span className="font-body text-xs flex-shrink-0" style={{ color: '#9CA3AF' }}>{levelInfo.xpIntoLevel}/{levelInfo.xpForNext} xp</span>
      </div>

      {/* Skill trend */}
      <div className="card p-5 md:p-6">
        <h3 className="font-heading text-lg md:text-xl lowercase mb-3" style={{ color: pc.secondary, fontWeight: 500 }}>
          progresso por skill
        </h3>
        <SkillLineChart weeks={skillTrend.weeks} series={skillTrend.series} />
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
          {skillTrend.series.map(s => (
            <div key={s.category} className="flex items-center gap-1.5">
              <span className="inline-block rounded-full flex-shrink-0" style={{ width: 8, height: 8, backgroundColor: s.color }} />
              <span className="font-body text-xs" style={{ color: '#6B7280' }}>
                {s.category} <strong style={{ color: s.color }}>{s.current}%</strong>
              </span>
              {s.category === 'Fala' && (
                <Info size={12} style={{ color: '#9CA3AF', cursor: 'help' }}
                  title="Autoavaliado por você após a prática — sem verificação automática de pronúncia" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Próxima aula VIP — auto suggestion */}
      <div className="card p-5 md:p-6">
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb size={18} style={{ color: PAGE_COLORS.vip.primary }} />
          <h3 className="font-heading text-lg lowercase" style={{ color: pc.secondary, fontWeight: 500 }}>próxima aula vip</h3>
        </div>
        <p className="font-body text-sm mb-3" style={{ color: '#9CA3AF' }}>
          {nextVipClass
            ? `${new Date(nextVipClass.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}${nextVipClass.topic ? ` · ${nextVipClass.topic}` : ''}`
            : 'agende sua próxima aula VIP no card abaixo'}
        </p>
        {vipSuggestions.length > 0 ? (
          <>
            <p className="text-xs font-body uppercase tracking-wide mb-2" style={{ color: '#9CA3AF' }}>revise antes:</p>
            <div className="space-y-2">
              {vipSuggestions.map(topic => (
                <button key={topic.id} onClick={() => setActivePage('praticar')}
                  className="w-full text-left flex items-center justify-between px-3 py-2 transition-all hover:scale-[1.01]"
                  style={{ borderRadius: '10px', backgroundColor: PAGE_COLORS.vip.accent, border: `1.5px solid ${PAGE_COLORS.vip.border}` }}>
                  <span className="font-body text-sm" style={{ color: '#1A1A2E' }}>{topic.title}</span>
                  <ChevronRight size={14} style={{ color: PAGE_COLORS.vip.primary }} />
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="font-body text-sm" style={{ color: '#9CA3AF' }}>nenhuma sugestão ainda — pratique alguns exercícios primeiro 🙂</p>
        )}
      </div>

      {/* Classes CRUD */}
      <ClassesCard onChange={() => setClassesTick(t => t + 1)} />

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

import { useState, useCallback } from 'react'
import { StickyNote } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ROADMAP_INITIAL } from '../data/roadmapData'
import { recordActivity } from '../utils/activity'
import { useAutoSave } from '../hooks/useAutoSave'
import SaveStatus from './SaveStatus'
import { PAGE_COLORS, getCardColorSet } from '../utils/colors'
import RichTextEditor from './RichTextEditor'

const TABS = ['Gramática', 'Vocabulário', 'Leitura', 'Fala']

const TAB_EN = {
  'Gramática':   'grammar',
  'Vocabulário': 'vocabulary',
  'Leitura':     'reading',
  'Fala':        'speaking',
}

const STATUS_CYCLE  = ['Não visto', 'Em progresso', 'Concluído', 'Revisar']
const STATUS_STYLES = {
  'Não visto':    { bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB' },
  'Em progresso': { bg: '#DBEAFE', color: '#2563EB', border: '#BFDBFE' },
  'Concluído':    { bg: '#D1FAE5', color: '#059669', border: '#A7F3D0' },
  'Revisar':      { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
}

function RoadmapItem({ item, st, expanded, onCycle, onToggleNote, onUpdateNote, pc }) {
  const [localNote, setLocalNote] = useState(item.notes || '')
  const { save: autoSave, status: saveStatus } = useAutoSave(onUpdateNote)

  return (
    <div className="card p-4" style={{ borderColor: st.border }}>
      <div className="flex items-center gap-3">
        <button onClick={onCycle}
          className="pill flex-shrink-0 cursor-pointer border transition-colors"
          style={{ backgroundColor: st.bg, color: st.color, borderColor: st.border }}>
          {item.status}
        </button>
        <span className="font-body text-sm flex-1 leading-snug" style={{ color: '#1A1A2E' }}>{item.title}</span>
        <button onClick={onToggleNote} className="btn-icon flex-shrink-0" title="anotações pessoais">
          <StickyNote size={16} />
        </button>
      </div>
      {expanded && (
        <div className="mt-3 pl-2 border-l-2" style={{ borderColor: pc.border }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-body" style={{ color: '#9CA3AF' }}>anotações pessoais</span>
            <SaveStatus status={saveStatus} />
          </div>
          <RichTextEditor
            value={localNote}
            onChange={val => { setLocalNote(val); autoSave(val) }}
            placeholder="suas anotações pessoais…"
            rows={3}
            accentColor={pc.accent}
            borderColor={pc.border}
            primaryColor={pc.primary}
          />
          <div className="flex justify-end mt-1">
            <button onClick={() => autoSave(localNote)} className="btn-primary text-xs py-1.5 px-3">Salvar</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Roadmap() {
  const today = new Date().toISOString().split('T')[0]

  // Migration: reset if schema is outdated (old "Escrita" key or item count mismatch)
  const EXPECTED_TOTAL = Object.values(ROADMAP_INITIAL).reduce((s, arr) => s + arr.length, 0)
  const [roadmap, setRoadmap] = useLocalStorage('ej_roadmap', (() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ej_roadmap'))
      if (!saved) return ROADMAP_INITIAL
      if ('Escrita' in saved) return ROADMAP_INITIAL   // old schema
      const savedTotal = Object.values(saved).reduce((s, arr) => s + arr.length, 0)
      if (savedTotal !== EXPECTED_TOTAL) return ROADMAP_INITIAL  // content update
    } catch {}
    return ROADMAP_INITIAL
  })())

  const [activeTab,     setActiveTab]     = useState('Gramática')
  const [expandedNotes, setExpandedNotes] = useState({})

  const cycleStatus = (tab, itemId) => {
    const items = roadmap[tab]
    const item  = items.find(i => i.id === itemId)
    const next  = STATUS_CYCLE[(STATUS_CYCLE.indexOf(item.status) + 1) % STATUS_CYCLE.length]
    setRoadmap({
      ...roadmap,
      [tab]: items.map(i => i.id === itemId ? {
        ...i, status: next,
        completedAt: next === 'Concluído' ? today : (next === 'Não visto' ? null : i.completedAt),
      } : i),
    })
    recordActivity()
  }

  const updateNote = useCallback((tab, itemId, note) => {
    setRoadmap(prev => ({ ...prev, [tab]: prev[tab].map(i => i.id === itemId ? { ...i, notes: note } : i) }))
  }, [setRoadmap])

  const tabProgress = TABS.reduce((acc, tab) => {
    const items = roadmap[tab] || []
    const done  = items.filter(i => i.status === 'Concluído').length
    acc[tab] = { done, total: items.length, pct: items.length > 0 ? Math.round((done / items.length) * 100) : 0 }
    return acc
  }, {})

  const getMonthlyData = () => {
    const allItems = Object.values(roadmap).flat()
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const monthKey  = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const monthName = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      const count     = allItems.filter(item => item.completedAt?.startsWith(monthKey)).length
      return { name: monthName, count }
    })
  }

  const monthlyData  = getMonthlyData()
  const maxCount     = Math.max(...monthlyData.map(m => m.count), 1)
  const currentItems = roadmap[activeTab] || []

  // Group items by their `group` property, preserving order
  const groupedItems = (() => {
    const groups = []
    for (const item of currentItems) {
      const g = item.group || null
      if (!groups.length || groups[groups.length - 1].name !== g) {
        groups.push({ name: g, items: [] })
      }
      groups[groups.length - 1].items.push(item)
    }
    return groups
  })()

  const pc = PAGE_COLORS.roadmap

  return (
    <div className="max-w-3xl">
      {/* Tab buttons */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-2 font-body text-sm font-semibold transition-all flex items-center gap-2"
            style={{
              borderRadius: '8px',
              background: activeTab === tab ? `linear-gradient(135deg, rgb(255, 159, 28) 0%, rgb(255, 107, 53) 100%)` : 'transparent',
              color: activeTab === tab ? 'white' : pc.primary,
              border: activeTab === tab ? 'none' : `2px solid #f8bbd0`,
              boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
            }}>
            {tab}
            <span className="text-xs px-1.5 py-0.5 font-bold"
              style={{
                borderRadius: '6px',
                backgroundColor: activeTab === tab ? 'rgba(255,255,255,0.25)' : pc.accent,
                color: activeTab === tab ? 'white' : pc.primary,
              }}>
              {tabProgress[tab].pct}%
            </span>
          </button>
        ))}
      </div>

      {/* Tab progress */}
      <div className="card-flat p-4 mb-4" style={{ borderColor: pc.border }}>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-heading lowercase" style={{ color: pc.primary, fontWeight: 500 }}>{TAB_EN[activeTab] || activeTab}</span>
          <span className="font-body" style={{ color:'#9CA3AF' }}>{tabProgress[activeTab].done} / {tabProgress[activeTab].total} tópicos</span>
        </div>
        <div className="overflow-hidden" style={{ height: '10px', borderRadius: '50px', backgroundColor: pc.accent }}>
          <div style={{
            height: '100%', borderRadius: '50px',
            width: `${tabProgress[activeTab].pct}%`,
            background: `linear-gradient(to right, ${pc.primary}, ${pc.secondary})`,
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>

      {/* Items grouped */}
      <div className="mb-8">
        {groupedItems.map((group, gi) => (
          <div key={group.name || gi}>
            {/* Group header */}
            {group.name && (
              <div className={`flex items-center gap-3 ${gi === 0 ? 'mb-3' : 'mt-6 mb-3'}`}>
                <span className="font-heading text-xs font-bold uppercase tracking-widest flex-shrink-0 lowercase"
                  style={{ color: pc.primary, fontWeight: 700, letterSpacing: '0.08em' }}>
                  {group.name}
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: pc.border }} />
                <span className="text-xs font-body flex-shrink-0 px-2 py-0.5"
                  style={{ backgroundColor: pc.accent, color: pc.primary, borderRadius: '6px' }}>
                  {group.items.filter(i => i.status === 'Concluído').length}/{group.items.length}
                </span>
              </div>
            )}

            {/* Items in this group */}
            <div className="space-y-2">
              {group.items.map(item => {
                const st = STATUS_STYLES[item.status] || STATUS_STYLES['Não visto']
                return (
                  <RoadmapItem
                    key={item.id}
                    item={item}
                    st={st}
                    activeTab={activeTab}
                    expanded={expandedNotes[item.id]}
                    onCycle={() => cycleStatus(activeTab, item.id)}
                    onToggleNote={() => setExpandedNotes(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                    onUpdateNote={(note) => updateNote(activeTab, item.id, note)}
                    pc={pc}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Monthly timeline */}
      <div className="card p-5 md:p-6">
        <h3 className="font-heading text-lg mb-4 lowercase" style={{ color: pc.primary, fontWeight: 500 }}>monthly timeline</h3>
        <div className="flex gap-3 items-end" style={{ height: '80px' }}>
          {monthlyData.map((month, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-body" style={{ color: '#9CA3AF' }}>{month.count > 0 ? month.count : ''}</span>
              <div className="w-full relative rounded-lg" style={{ height: '60px', backgroundColor: pc.accent }}>
                <div className="absolute bottom-0 left-0 right-0 rounded-lg transition-all duration-500"
                  style={{ height: `${(month.count / maxCount) * 100}%`, background: `linear-gradient(to top, ${pc.secondary}, ${pc.primary})` }} />
              </div>
              <span className="text-xs font-body text-center leading-tight" style={{ color: '#9CA3AF' }}>{month.name}</span>
            </div>
          ))}
        </div>
        <p className="text-xs font-body text-center mt-3" style={{ color: '#9CA3AF' }}>tópicos concluídos por mês</p>
      </div>
    </div>
  )
}

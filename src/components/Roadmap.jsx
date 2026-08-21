import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { StickyNote, Dumbbell, Star } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getRoadmapForLevel } from '../data/roadmapData'
import { useLevel } from '../utils/levels'
import { recordActivity } from '../utils/activity'
import { useAutoSave } from '../hooks/useAutoSave'
import SaveStatus from './SaveStatus'
import { PAGE_COLORS, getCardColorSet } from '../utils/colors'
import NoteFields from './NoteFields'
import { getNotesByTopic, addNote, updateNote as updateNoteEntity } from '../utils/notes'
import { isTopicPracticed } from '../utils/exercises'
import { pushRoadmap } from '../utils/syncEngine'
import { addSpeakingAssessment, getAssessmentsByTopic, ratingEmoji } from '../utils/speakingAssessments'
import SpeakingAssessmentModal from './SpeakingAssessmentModal'

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

function RoadmapItem({ item, st, expanded, onCycle, onToggleNote, pc, practiced, level, isSpeaking }) {
  const [note, setNote] = useState(() => getNotesByTopic(item.id, level)[0] || null)
  const speakingHistory = isSpeaking ? getAssessmentsByTopic(item.id, level) : []
  // Mirrors `note` synchronously so `persist` can decide create-vs-update
  // without putting side effects (addNote/updateNote hit localStorage)
  // inside a setState updater — React StrictMode double-invokes those on
  // purpose to catch impurities, which would otherwise create duplicate notes.
  const noteRef = useRef(note)

  // One-time migration of the legacy plain-text note that used to live on the
  // roadmap item itself (item.notes), into a proper Note entity.
  useEffect(() => {
    if (!note && item.notes && item.notes.trim()) {
      const migrated = addNote({ topicId: item.id, content: item.notes, tags: [], favorite: false, level })
      noteRef.current = migrated
      setNote(migrated)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [localContent, setLocalContent] = useState(note?.content ?? item.notes ?? '')

  const persist = useCallback((patch) => {
    const current = noteRef.current
    const result = current
      ? updateNoteEntity(current.id, patch)
      : addNote({ topicId: item.id, content: '', tags: [], favorite: false, level, ...patch })
    noteRef.current = result
    setNote(result)
  }, [item.id, level])

  const { save: autoSaveContent, status: saveStatus } = useAutoSave((content) => persist({ content }))

  return (
    <div className="card p-4" style={{ borderColor: st.border }}>
      <div className="flex items-center gap-3">
        <button onClick={onCycle}
          className="pill flex-shrink-0 cursor-pointer border transition-colors"
          style={{ backgroundColor: st.bg, color: st.color, borderColor: st.border }}>
          {item.status}
        </button>
        <span className="font-body text-sm flex-1 leading-snug" style={{ color: '#1A1A2E' }}>{item.title}</span>
        {note?.favorite && <Star size={14} className="flex-shrink-0" fill="#FBBF24" color="#FBBF24" title="anotação favorita" />}
        {practiced && item.status !== 'Concluído' && (
          <Dumbbell size={14} className="flex-shrink-0" style={{ color: '#26C6A0' }} title="exercícios concluídos em praticar" />
        )}
        <button onClick={onToggleNote} className="btn-icon flex-shrink-0" title="anotações pessoais">
          <StickyNote size={16} />
        </button>
      </div>
      {isSpeaking && speakingHistory.length > 0 && (
        <p className="font-body text-xs mt-1.5 pl-1" style={{ color: '#9CA3AF' }} title={speakingHistory.map(a => a.note).filter(Boolean).join(' · ')}>
          🗣️ praticado {speakingHistory.length}x: {speakingHistory.map(a => ratingEmoji(a.rating)).join(' ')}
        </p>
      )}
      {expanded && (
        <div className="mt-3 pl-2 border-l-2" style={{ borderColor: pc.border }}>
          <div className="flex justify-end mb-1"><SaveStatus status={saveStatus} /></div>
          <NoteFields
            content={localContent}
            onContentChange={val => { setLocalContent(val); autoSaveContent(val) }}
            tags={note?.tags || []}
            onTagsChange={tags => persist({ tags })}
            favorite={note?.favorite || false}
            onToggleFavorite={() => persist({ favorite: !(note?.favorite) })}
            pc={pc}
            placeholder="suas anotações pessoais…"
            rows={3}
          />
        </div>
      )}
    </div>
  )
}

export default function Roadmap() {
  const today = new Date().toISOString().split('T')[0]
  const { currentLevel, checkUnlocks } = useLevel()
  const roadmapKey = `ej_roadmap__${currentLevel}`
  const ROADMAP_INITIAL = getRoadmapForLevel(currentLevel)

  // Migration: reset if schema is outdated (old "Escrita" key or item count mismatch)
  const EXPECTED_TOTAL = Object.values(ROADMAP_INITIAL).reduce((s, arr) => s + arr.length, 0)
  const [roadmap, setRoadmap] = useLocalStorage(roadmapKey, (() => {
    try {
      // One-time migration: A1 progress used to live under the un-suffixed
      // 'ej_roadmap' key, before per-level keys existed.
      if (currentLevel === 'A1' && !localStorage.getItem(roadmapKey)) {
        const legacy = localStorage.getItem('ej_roadmap')
        if (legacy) localStorage.setItem(roadmapKey, legacy)
      }
      const saved = JSON.parse(localStorage.getItem(roadmapKey))
      if (!saved) return ROADMAP_INITIAL
      if ('Escrita' in saved) return ROADMAP_INITIAL   // old schema
      const savedTotal = Object.values(saved).reduce((s, arr) => s + arr.length, 0)
      if (savedTotal !== EXPECTED_TOTAL) return ROADMAP_INITIAL  // content update
    } catch {}
    return ROADMAP_INITIAL
  })())

  const [activeTab,     setActiveTab]     = useState('Gramática')
  const [expandedNotes, setExpandedNotes] = useState({})
  // Set while a "Fala" topic is about to be marked Concluído and is waiting
  // on the self-assessment modal — the status change itself only happens
  // once that's answered (see confirmSpeakingAssessment below).
  const [pendingAssessment, setPendingAssessment] = useState(null)

  const applyStatusChange = (tab, itemId, next) => {
    const items = roadmap[tab]
    const updatedRoadmap = {
      ...roadmap,
      [tab]: items.map(i => i.id === itemId ? {
        ...i, status: next,
        completedAt: next === 'Concluído' ? today : (next === 'Não visto' ? null : i.completedAt),
      } : i),
    }
    setRoadmap(updatedRoadmap)
    pushRoadmap(currentLevel, updatedRoadmap)
    recordActivity()
    checkUnlocks() // marking something Concluído might complete this level's roadmap
  }

  const cycleStatus = (tab, itemId) => {
    const items = roadmap[tab]
    const item  = items.find(i => i.id === itemId)
    const next  = STATUS_CYCLE[(STATUS_CYCLE.indexOf(item.status) + 1) % STATUS_CYCLE.length]

    // Speaking topics need an honest self-check before they can be marked
    // done — there's no automatic pronunciation verification (no
    // SpeechRecognition yet), so "Concluído" would otherwise mean nothing
    // more than a click, same as any other category.
    if (tab === 'Fala' && next === 'Concluído') {
      setPendingAssessment({ tab, itemId, next, itemTitle: item.title })
      return
    }
    applyStatusChange(tab, itemId, next)
  }

  const confirmSpeakingAssessment = ({ rating, note }) => {
    if (!pendingAssessment) return
    const { tab, itemId, next } = pendingAssessment
    addSpeakingAssessment({ topicId: itemId, rating, note, level: currentLevel })
    applyStatusChange(tab, itemId, next)
    setPendingAssessment(null)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tabProgress = useMemo(() => TABS.reduce((acc, tab) => {
    const items = roadmap[tab] || []
    const done  = items.filter(i => i.status === 'Concluído' || isTopicPracticed(i.id, currentLevel)).length
    acc[tab] = { done, total: items.length, pct: items.length > 0 ? Math.round((done / items.length) * 100) : 0 }
    return acc
  }, {}), [roadmap, currentLevel])

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
                    pc={pc}
                    practiced={isTopicPracticed(item.id, currentLevel)}
                    level={currentLevel}
                    isSpeaking={activeTab === 'Fala'}
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

      {pendingAssessment && (
        <SpeakingAssessmentModal
          topicTitle={pendingAssessment.itemTitle}
          onCancel={() => setPendingAssessment(null)}
          onSubmit={confirmSpeakingAssessment}
        />
      )}
    </div>
  )
}

import { useState, useEffect, useMemo } from 'react'
import { Plus, Archive, ArchiveRestore, Trash2, Zap, ChevronRight, Repeat } from 'lucide-react'
import { ERROR_LOG_TYPES } from '../data/schema'
import {
  getErrorLogs, addErrorLog, deleteErrorLog,
  archiveErrorLog, unarchiveErrorLog, migrateLegacyErrors,
} from '../utils/errorLog'
import { seedExercisesFromBank } from '../utils/exercises'
import { getAllExercisesForLevel } from '../data/exerciseBank'
import { getRoadmapForLevel, findRoadmapTopic } from '../data/roadmapData'
import { confirmDialog } from '../utils/confirmDialog'
import { buildReviewPool, getTopicsNeedingReview } from '../utils/reviewQueue'
import { useLevel, DEFAULT_LEVEL } from '../utils/levels'
import { PAGE_COLORS } from '../utils/colors'
import RichTextEditor from './RichTextEditor'
import ExercisePlayer from './ExercisePlayer'

const pc = PAGE_COLORS.erros

const TYPE_COLORS = {
  'gramática':   { bg: '#FCE4EC', color: '#C2185B' },
  'vocabulário': { bg: '#FFF3E0', color: '#FF6B35' },
  'pronúncia':   { bg: '#E0F7FA', color: '#26C6A0' },
}

const EMPTY_FORM = { description: '', type: ERROR_LOG_TYPES[0], topicId: '' }
const REINCIDENT_THRESHOLD = 2

export default function BancoDeErros() {
  const { currentLevel, checkUnlocks } = useLevel()
  const [tick,          setTick]          = useState(0)
  const [typeFilter,    setTypeFilter]    = useState('todos')
  const [showArchived,  setShowArchived]  = useState(false)
  const [showForm,      setShowForm]      = useState(false)
  const [form,          setForm]          = useState(EMPTY_FORM)
  const [quizExercises, setQuizExercises] = useState(null)

  useEffect(() => {
    migrateLegacyErrors()
    seedExercisesFromBank(getAllExercisesForLevel(currentLevel))
    setTick(t => t + 1)
  }, [currentLevel])

  const errors = useMemo(() => getErrorLogs(), [tick])
  const refresh = () => setTick(t => t + 1)

  const activeCount   = errors.filter(e => !e.archived).length
  const archivedCount = errors.filter(e => e.archived).length

  const visible = errors
    .filter(e => (showArchived ? e.archived : !e.archived))
    .filter(e => typeFilter === 'todos' || e.type === typeFilter)

  // Errors stay visible across every level, so the grouping key includes
  // level too — a topicId like "g01" can mean something different per level.
  const grouped = useMemo(() => {
    const map = new Map()
    visible.forEach(e => {
      const errLevel = e.level || DEFAULT_LEVEL
      const key = e.topicId ? `${e.topicId}__${errLevel}` : '__none__'
      if (!map.has(key)) map.set(key, { topicId: e.topicId || null, level: errLevel, items: [] })
      map.get(key).items.push(e)
    })
    return [...map.values()]
      .map(g => ({
        ...g,
        topic: g.topicId ? findRoadmapTopic(g.topicId, g.level) : null,
        items: g.items.sort((a, b) =>
          b.recurrenceCount - a.recurrenceCount || new Date(b.lastOccurrence) - new Date(a.lastOccurrence)),
      }))
      .sort((a, b) => b.items.length - a.items.length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  const reviewPool = useMemo(() => buildReviewPool({ targetTotal: 12, perTopic: 5, level: currentLevel }), [tick, currentLevel])
  const topicsNeedingReview = useMemo(() => getTopicsNeedingReview(currentLevel), [tick, currentLevel])

  const addError = () => {
    if (!form.description.trim()) return
    addErrorLog({
      description: form.description,
      type: form.type,
      topicId: form.topicId || null,
      level: currentLevel,
    })
    setForm(EMPTY_FORM); setShowForm(false); refresh()
  }

  const toggleArchived = (e) => {
    (e.archived ? unarchiveErrorLog : archiveErrorLog)(e.id)
    refresh()
  }

  const remove = async (id) => {
    if (await confirmDialog('Excluir este erro permanentemente?')) { deleteErrorLog(id); refresh() }
  }

  const startQuiz = () => { if (reviewPool.length) setQuizExercises(reviewPool) }
  const exitQuiz  = () => { setQuizExercises(null); refresh(); checkUnlocks() }

  if (quizExercises) {
    return (
      <div>
        <div className="max-w-lg mx-auto mb-4">
          <p className="font-heading text-lg lowercase" style={{ color: pc.primary, fontWeight: 700 }}>quiz de revisão</p>
        </div>
        <ExercisePlayer exercises={quizExercises} onExit={exitQuiz} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { value: activeCount,   label: 'ativos',     color: pc.primary,   bg: pc.accent },
          { value: archivedCount, label: 'arquivados', color: '#26C6A0',    bg: '#E0F7FA' },
          { value: errors.length, label: 'total',      color: pc.secondary, bg: '#F9FAFB' },
        ].map((s, i) => (
          <div key={i} className="card p-4 text-center">
            <div className="font-heading text-3xl" style={{ color: s.color }}>{s.value}</div>
            <p className="font-body text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Gerar quiz de revisão */}
      <button onClick={startQuiz} disabled={!reviewPool.length}
        className="w-full flex items-center gap-4 p-5 mb-6 transition-all"
        style={{
          borderRadius: '16px',
          background: reviewPool.length ? `linear-gradient(135deg, ${pc.primary} 0%, ${pc.secondary} 100%)` : '#F3F4F6',
          cursor: reviewPool.length ? 'pointer' : 'not-allowed',
          boxShadow: reviewPool.length ? '0 4px 14px rgba(0,0,0,0.15)' : 'none',
        }}>
        <div className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
          style={{ backgroundColor: reviewPool.length ? 'rgba(255,255,255,0.25)' : '#E5E7EB' }}>
          <Zap size={20} color={reviewPool.length ? 'white' : '#9CA3AF'} />
        </div>
        <div className="flex-1 text-left">
          <p className="font-heading text-lg lowercase" style={{ color: reviewPool.length ? 'white' : '#9CA3AF', fontWeight: 700 }}>
            gerar quiz de revisão
          </p>
          <p className="font-body text-sm" style={{ color: reviewPool.length ? 'rgba(255,255,255,0.85)' : '#9CA3AF' }}>
            {reviewPool.length
              ? `${reviewPool.length} exercícios de ${topicsNeedingReview.length} tópico${topicsNeedingReview.length > 1 ? 's' : ''} com erros`
              : 'nenhum erro vinculado a um tópico com exercícios ainda'}
          </p>
        </div>
        {reviewPool.length > 0 && <ChevronRight size={20} color="white" className="flex-shrink-0" />}
      </button>

      {/* Filters + Add */}
      <div className="flex flex-wrap gap-2 mb-5 justify-between items-start">
        <div className="flex gap-2 flex-wrap">
          {['todos', ...ERROR_LOG_TYPES].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className="px-3 py-1.5 text-xs font-body font-semibold transition-colors"
              style={{
                borderRadius: '8px',
                backgroundColor: typeFilter === t ? pc.primary : '#F3F4F6',
                color: typeFilter === t ? 'white' : '#6B7280',
              }}>
              {t}
            </button>
          ))}
          <button onClick={() => setShowArchived(a => !a)}
            className="px-3 py-1.5 text-xs font-body font-semibold transition-colors inline-flex items-center gap-1.5"
            style={{
              borderRadius: '8px',
              backgroundColor: showArchived ? '#E0F7FA' : '#F3F4F6',
              color: showArchived ? '#26C6A0' : '#6B7280',
            }}>
            <Archive size={12} /> {showArchived ? 'arquivados' : 'mostrar arquivados'}
          </button>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          <Plus size={14} /> novo erro
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-5 mb-5" style={{ borderColor: pc.border }}>
          <h3 className="font-heading text-lg mb-3 lowercase" style={{ color: pc.primary, fontWeight: 500 }}>log recurring error</h3>
          <div className="mb-3">
            <RichTextEditor
              value={form.description}
              onChange={val => setForm({ ...form, description: val })}
              placeholder="Descreva o erro (ex: confundo 'since' e 'for' em durações…)"
              rows={3}
              accentColor={pc.accent}
              borderColor={pc.border}
              primaryColor={pc.primary}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-field">
              {ERROR_LOG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={form.topicId} onChange={e => setForm({ ...form, topicId: e.target.value })} className="input-field">
              <option value="">sem tópico (avulso)</option>
              {Object.entries(getRoadmapForLevel(currentLevel)).map(([cat, items]) => (
                <optgroup key={cat} label={cat}>
                  {items.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={addError} className="btn-primary flex-1 justify-center">salvar</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">cancelar</button>
          </div>
        </div>
      )}

      {/* Grouped error list */}
      {grouped.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🎉</div>
          <p className="font-heading text-xl lowercase" style={{ color: '#D1D5DB', fontWeight: 500 }}>
            {showArchived
              ? 'nenhum erro arquivado'
              : typeFilter !== 'todos'
              ? `sem erros em ${typeFilter}`
              : errors.length === 0
              ? 'você ainda não tem erros registrados'
              : 'all clear!'}
          </p>
          {!showArchived && typeFilter === 'todos' && errors.length === 0 && (
            <p className="font-body text-sm mt-2" style={{ color: '#9CA3AF' }}>
              erre um exercício em "praticar" ou clique em "novo erro" para começar
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(group => (
            <div key={`${group.topicId || '__none__'}__${group.level}`}>
              <div className="flex items-center gap-3 mb-3">
                {group.topic
                  ? <span className="pill" style={{ backgroundColor: pc.accent, color: pc.primary }}>{group.topic.title}</span>
                  : <span className="pill" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>sem tópico vinculado</span>}
                <span className="pill" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>{group.level}</span>
                <div className="flex-1 h-px" style={{ backgroundColor: pc.border }} />
                <span className="text-xs font-body" style={{ color: '#9CA3AF' }}>{group.items.length} erro{group.items.length > 1 ? 's' : ''}</span>
              </div>

              <div className="space-y-3">
                {group.items.map(error => {
                  const tc = TYPE_COLORS[error.type] || { bg: '#F3F4F6', color: '#6B7280' }
                  const reincident = error.recurrenceCount >= REINCIDENT_THRESHOLD
                  return (
                    <div key={error.id}
                      className={`p-4 transition-all hover:scale-[1.01] border-[1.5px] ${error.archived ? 'opacity-60' : ''}`}
                      style={{
                        borderRadius: '12px',
                        backgroundColor: error.archived ? '#F9FAFB' : (reincident ? '#FFF8E1' : pc.accent),
                        borderColor: error.archived ? '#E5E7EB' : (reincident ? '#FDE68A' : pc.border),
                        boxShadow: error.archived ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
                      }}>
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className={`font-body text-sm rich-editor-body ${error.archived ? 'line-through' : ''}`}
                            style={{ color: error.archived ? '#9CA3AF' : '#1A1A2E' }}
                            dangerouslySetInnerHTML={{ __html: error.description }} />
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="pill" style={{ backgroundColor: tc.bg, color: tc.color }}>{error.type}</span>
                            {reincident && (
                              <span className="pill inline-flex items-center gap-1" style={{ backgroundColor: '#FDE68A', color: '#92400E' }}>
                                <Repeat size={10} /> reincidente ×{error.recurrenceCount}
                              </span>
                            )}
                            <span className="text-xs font-body" style={{ color: '#9CA3AF' }}>
                              {new Date(error.lastOccurrence).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-shrink-0">
                          <button onClick={() => toggleArchived(error)} className="btn-icon"
                            title={error.archived ? 'desarquivar' : 'arquivar (já domino isso)'}>
                            {error.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                          </button>
                          <button onClick={() => remove(error.id)} className="btn-icon danger" title="excluir">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

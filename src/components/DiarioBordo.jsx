import { useState, useCallback, useMemo, useRef } from 'react'
import { Plus, X, Pencil, Trash2 } from 'lucide-react'
import { getDiarioEntries, addDiarioEntry, updateDiarioEntry, deleteDiarioEntry } from '../utils/diario'
import { useLevel } from '../utils/levels'
import { useAutoSave } from '../hooks/useAutoSave'
import SaveStatus from './SaveStatus'
import { recordActivity } from '../utils/activity'
import { PAGE_COLORS } from '../utils/colors'
import RichTextEditor from './RichTextEditor'

const todayStr = () => new Date().toISOString().split('T')[0]
const EMPTY = {
  date: todayStr(), content: '', corrections: '',
  grammarErrors: [], vocabSuggestions: [], naturalPhrases: [],
}
const pc = PAGE_COLORS.diario

const LIST_SECTIONS = [
  { key: 'grammarErrors',    label: 'erros de gramática',                icon: '✏️', bg: '#FEE2E2', color: '#DC2626', placeholder: 'ex: "I have 20 years" → "I am 20 years old"' },
  { key: 'vocabSuggestions', label: 'vocabulário — poderia usar',        icon: '📚', bg: '#FFF3E0', color: '#FF6B35', placeholder: 'ex: "big" → "enormous"' },
  { key: 'naturalPhrases',   label: 'frases que soam mais naturais',     icon: '💬', bg: '#D1FAE5', color: '#059669', placeholder: 'ex: "I am agree" → "I agree"' },
]

function fmtDate(d) {
  if (!d) return ''
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').trim()
}

function countWords(html) {
  const text = stripHtml(html)
  return text ? text.split(/\s+/).filter(Boolean).length : 0
}

// Monday (YYYY-MM-DD) of the week containing the given date string.
function getMonday(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay() // 0=Sun..6=Sat
  d.setDate(d.getDate() - ((day + 6) % 7))
  return d.toISOString().split('T')[0]
}

function ListField({ section, items, onChange }) {
  const updateItem = (i, val) => onChange(items.map((it, idx) => idx === i ? val : it))
  const removeItem = (i) => onChange(items.filter((_, idx) => idx !== i))
  const addItem = () => onChange([...items, ''])

  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-body mb-1.5" style={{ color: '#9CA3AF' }}>
        <span>{section.icon}</span> {section.label}
      </label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input type="text" value={item} onChange={e => updateItem(i, e.target.value)}
              placeholder={section.placeholder} className="input-field flex-1 text-sm" />
            <button onClick={() => removeItem(i)} className="btn-icon danger flex-shrink-0"><X size={14} /></button>
          </div>
        ))}
      </div>
      <button onClick={addItem} className="btn-secondary text-xs py-1.5 px-3 mt-2">
        <Plus size={12} /> adicionar
      </button>
    </div>
  )
}

function ListDisplay({ section, items }) {
  if (!items || items.length === 0) return null
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: section.bg }}>
      <p className="font-heading text-sm mb-2 lowercase flex items-center gap-1.5" style={{ color: section.color, fontWeight: 700 }}>
        <span>{section.icon}</span> {section.label}
      </p>
      <ul className="space-y-1 pl-1">
        {items.map((item, i) => (
          <li key={i} className="font-body text-sm flex items-start gap-1.5" style={{ color: section.color }}>
            <span aria-hidden>•</span><span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function DiarioBordo() {
  const { currentLevel } = useLevel()
  const [tick, setTick] = useState(0)
  const refresh = () => setTick(t => t + 1)
  // Diário entries stay visible across all levels — this is a free-form
  // journal, not curriculum content — so we never filter `entries` by level.
  const entries = useMemo(() => getDiarioEntries(), [tick])

  const [mode,    setMode]    = useState('list')
  const [form,    setForm]    = useState({ ...EMPTY })
  const [editId,  setEditId]  = useState(null)
  const [viewId,  setViewId]  = useState(null)

  // Mirrors editId synchronously so the autosave path never creates two
  // entries when keystrokes fire faster than a React state commit (the same
  // class of bug fixed earlier in Roadmap.jsx's per-topic note autosave).
  const editIdRef = useRef(null)

  const doSave = useCallback(() => {
    if (!form.content.trim() || !form.date) return
    if (editIdRef.current) {
      updateDiarioEntry(editIdRef.current, form)
    } else {
      const created = addDiarioEntry({ ...form, level: currentLevel })
      editIdRef.current = created.id
      setEditId(created.id)
    }
    refresh()
    recordActivity()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, currentLevel])

  const { save: autoSave, status: saveStatus } = useAutoSave(doSave)

  const saveAndExit = () => {
    if (!form.content.trim() || !form.date) return
    if (editIdRef.current) {
      updateDiarioEntry(editIdRef.current, form)
    } else {
      addDiarioEntry({ ...form, level: currentLevel })
    }
    refresh()
    setForm({ ...EMPTY }); setEditId(null); editIdRef.current = null
    setMode('list'); recordActivity()
  }

  const deleteEntry = (id) => {
    if (!window.confirm('Excluir esta entrada?')) return
    deleteDiarioEntry(id)
    refresh()
    if (viewId === id) setMode('list')
  }

  const startEdit = (entry) => {
    setForm({
      date: entry.date, content: entry.content, corrections: entry.corrections || '',
      grammarErrors: entry.grammarErrors || [],
      vocabSuggestions: entry.vocabSuggestions || [],
      naturalPhrases: entry.naturalPhrases || [],
    })
    editIdRef.current = entry.id
    setEditId(entry.id); setMode('form')
  }

  const startNew = () => {
    editIdRef.current = null
    setForm({ ...EMPTY }); setEditId(null); setMode('form')
  }

  const viewEntry = entries.find(e => e.id === viewId)

  // Word count per week (Mon–Sun), last 8 weeks ending this week — across
  // all levels, this is about writing practice overall, not curriculum.
  const weeklyData = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (7 - i) * 7)
      const monday = getMonday(d.toISOString().split('T')[0])
      const sunday = new Date(monday + 'T12:00:00')
      sunday.setDate(sunday.getDate() + 6)
      const sundayStr = sunday.toISOString().split('T')[0]
      const words = entries
        .filter(e => e.date >= monday && e.date <= sundayStr)
        .reduce((sum, e) => sum + countWords(e.content), 0)
      const label = new Date(monday + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      return { monday, words, label }
    })
  }, [entries])

  const thisWeekWords = weeklyData[weeklyData.length - 1]?.words || 0
  const maxWeeklyWords = Math.max(...weeklyData.map(w => w.words), 1)

  /* ── View ── */
  if (mode === 'view' && viewEntry) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-6">
          <div className="flex justify-between items-start mb-5 gap-3 flex-wrap">
            <div>
              <p className="text-xs font-body uppercase tracking-wide" style={{ color: '#9CA3AF' }}>entrada do diário</p>
              <div className="flex items-center gap-2">
                <p className="font-heading text-xl lowercase" style={{ color: pc.primary, fontWeight: 700 }}>{fmtDate(viewEntry.date)}</p>
                <span className="pill" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>{viewEntry.level || 'A1'}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => startEdit(viewEntry)} className="btn-secondary text-sm py-2 px-4">
                <Pencil size={14} /> editar
              </button>
              <button onClick={() => deleteEntry(viewEntry.id)} className="btn-danger text-sm py-2 px-4">
                <Trash2 size={14} /> excluir
              </button>
              <button onClick={() => setMode('list')} className="btn-secondary text-sm py-2 px-4">← voltar</button>
            </div>
          </div>

          <div className="rounded-xl p-4 mb-4 rich-editor-body" style={{ backgroundColor: pc.accent, border: `1.5px solid ${pc.border}`, color: '#1A1A2E' }}
            dangerouslySetInnerHTML={{ __html: viewEntry.content }} />

          <p className="text-xs font-body mb-4" style={{ color: '#9CA3AF' }}>{countWords(viewEntry.content)} palavras</p>

          <div className="space-y-3 mb-4">
            {LIST_SECTIONS.map(section => (
              <ListDisplay key={section.key} section={section} items={viewEntry[section.key]} />
            ))}
          </div>

          {viewEntry.corrections && (
            <div className="rounded-xl p-4" style={{ backgroundColor: '#FFF8E1', border: '1.5px solid #FDE68A' }}>
              <p className="font-heading text-base mb-2 lowercase" style={{ color: '#D97706', fontWeight: 500 }}>✏️ teacher's corrections</p>
              <div className="font-body text-sm rich-editor-body" style={{ color: '#92400E' }}
                dangerouslySetInnerHTML={{ __html: viewEntry.corrections }} />
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ── Form ── */
  if (mode === 'form') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-6">
          <h2 className="font-heading text-xl mb-5 lowercase" style={{ color: pc.primary, fontWeight: 500 }}>
            {editId ? 'edit entry' : 'new entry 📓'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-body mb-1" style={{ color: '#9CA3AF' }}>data</label>
              <input type="date" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="input-field" />
            </div>

            {/* Content with auto-save */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-body" style={{ color: '#9CA3AF' }}>escrita livre em inglês (texto original)</label>
                <SaveStatus status={saveStatus} />
              </div>
              <RichTextEditor
                value={form.content}
                onChange={val => { setForm(prev => ({ ...prev, content: val })); autoSave() }}
                placeholder="Write here in English…"
                rows={9}
                accentColor={pc.accent}
                borderColor={pc.border}
                primaryColor={pc.primary}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs font-body" style={{ color: '#9CA3AF' }}>{countWords(form.content)} palavras</span>
                <button onClick={() => autoSave()} className="btn-primary text-xs py-2 px-4">Salvar</button>
              </div>
            </div>

            {/* Structured self-review fields */}
            <div className="space-y-4 pt-2 border-t" style={{ borderColor: '#F3F4F6' }}>
              <p className="text-xs font-body uppercase tracking-wide pt-3" style={{ color: '#9CA3AF' }}>feedback (preenchimento manual)</p>
              {LIST_SECTIONS.map(section => (
                <ListField
                  key={section.key}
                  section={section}
                  items={form[section.key]}
                  onChange={vals => setForm(prev => ({ ...prev, [section.key]: vals }))}
                />
              ))}
            </div>

            {/* Corrections with auto-save */}
            <div className="pt-2 border-t" style={{ borderColor: '#F3F4F6' }}>
              <label className="block text-xs font-body mb-1 pt-3" style={{ color: '#9CA3AF' }}>correções da teacher (opcional)</label>
              <RichTextEditor
                value={form.corrections}
                onChange={val => setForm(prev => ({ ...prev, corrections: val }))}
                placeholder="Anote feedbacks e correções…"
                rows={4}
                accentColor={pc.accent}
                borderColor={pc.border}
                primaryColor={pc.primary}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={saveAndExit} className="btn-primary flex-1 justify-center">salvar e fechar</button>
            <button onClick={() => { setMode('list'); setEditId(null); editIdRef.current = null }} className="btn-secondary flex-1 justify-center">cancelar</button>
          </div>
        </div>
      </div>
    )
  }

  /* ── List ── */
  return (
    <div className="max-w-2xl">
      {/* Weekly word count */}
      <div className="card p-5 mb-5" style={{ borderColor: pc.border }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-body uppercase tracking-wide" style={{ color: '#9CA3AF' }}>palavras escritas esta semana</p>
            <p className="font-heading text-3xl" style={{ color: pc.primary, fontWeight: 700 }}>{thisWeekWords}</p>
          </div>
          <span className="text-3xl" aria-hidden>✍️</span>
        </div>
        <div className="flex gap-2 items-end" style={{ height: '52px' }}>
          {weeklyData.map((w, i) => (
            <div key={w.monday} className="flex-1 flex flex-col items-center gap-1" title={`semana de ${w.label}: ${w.words} palavras`}>
              <div className="w-full relative rounded-md" style={{ height: '36px', backgroundColor: pc.accent }}>
                <div className="absolute bottom-0 left-0 right-0 rounded-md transition-all duration-500"
                  style={{
                    height: `${(w.words / maxWeeklyWords) * 100}%`,
                    background: i === weeklyData.length - 1
                      ? `linear-gradient(to top, ${pc.secondary}, ${pc.primary})`
                      : pc.border,
                  }} />
              </div>
              <span className="text-[10px] font-body text-center leading-tight" style={{ color: '#9CA3AF' }}>{w.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end mb-5">
        <button onClick={startNew} className="btn-primary">
          <Plus size={16} /> nova entrada
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📓</div>
          <p className="font-heading text-xl lowercase" style={{ color: '#D1D5DB', fontWeight: 500 }}>no entries yet 📓</p>
          <p className="font-body text-sm mt-2" style={{ color: '#9CA3AF' }}>comece escrevendo em inglês hoje!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => {
            const feedbackCount = LIST_SECTIONS.reduce((sum, s) => sum + (entry[s.key]?.length || 0), 0)
            return (
              <div key={entry.id} className="card p-5 group cursor-pointer"
                style={{ borderColor: pc.border }}
                onClick={() => { setViewId(entry.id); setMode('view') }}>
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-heading lowercase" style={{ color: pc.primary, fontWeight: 500 }}>{fmtDate(entry.date)}</p>
                      <span className="pill" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>{entry.level || 'A1'}</span>
                    </div>
                    <p className="font-body text-sm mt-1 truncate" style={{ color: '#6B7280' }}>{stripHtml(entry.content)}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs font-body" style={{ color: '#9CA3AF' }}>{countWords(entry.content)} palavras</span>
                      {feedbackCount > 0 && (
                        <span className="text-xs font-body font-semibold" style={{ color: pc.primary }}>📋 {feedbackCount} anotações de feedback</span>
                      )}
                      {entry.corrections && (
                        <span className="text-xs font-body font-semibold" style={{ color: '#D97706' }}>✏️ tem correções</span>
                      )}
                    </div>
                  </div>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity ml-3 flex-shrink-0">
                    <button onClick={e => { e.stopPropagation(); startEdit(entry) }} className="btn-icon"><Pencil size={14} /></button>
                    <button onClick={e => { e.stopPropagation(); deleteEntry(entry.id) }} className="btn-icon danger"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

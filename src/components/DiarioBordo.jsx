import { useState, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useAutoSave } from '../hooks/useAutoSave'
import SaveStatus from './SaveStatus'
import { recordActivity } from '../utils/activity'
import { PAGE_COLORS } from '../utils/colors'
import RichTextEditor from './RichTextEditor'

const todayStr = () => new Date().toISOString().split('T')[0]
const EMPTY = { date: todayStr(), content: '', corrections: '' }
const pc = PAGE_COLORS.diario

function fmtDate(d) {
  if (!d) return ''
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function DiarioBordo() {
  const [entries, setEntries] = useLocalStorage('ej_diario', [])
  const [mode,    setMode]    = useState('list')
  const [form,    setForm]    = useState({ ...EMPTY })
  const [editId,  setEditId]  = useState(null)
  const [viewId,  setViewId]  = useState(null)

  const doSave = useCallback(() => {
    if (!form.content.trim() || !form.date) return
    if (editId) {
      setEntries(prev => prev.map(e => e.id === editId ? { ...e, ...form } : e))
    } else {
      const newEntry = { ...form, id: Date.now() }
      setEntries(prev => [newEntry, ...prev])
      setEditId(newEntry.id)
    }
    recordActivity()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, editId])

  const { save: autoSave, status: saveStatus } = useAutoSave(doSave)

  const saveAndExit = () => {
    if (!form.content.trim() || !form.date) return
    if (editId) {
      setEntries(entries.map(e => e.id === editId ? { ...e, ...form } : e))
    } else {
      setEntries([{ ...form, id: Date.now() }, ...entries])
    }
    setForm({ ...EMPTY }); setEditId(null); setMode('list'); recordActivity()
  }

  const deleteEntry = (id) => {
    if (!window.confirm('Excluir esta entrada?')) return
    setEntries(entries.filter(e => e.id !== id))
    if (viewId === id) setMode('list')
  }

  const startEdit = (entry) => {
    setForm({ date: entry.date, content: entry.content, corrections: entry.corrections || '' })
    setEditId(entry.id); setMode('form')
  }

  const viewEntry = entries.find(e => e.id === viewId)

  /* ── View ── */
  if (mode === 'view' && viewEntry) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-6">
          <div className="flex justify-between items-start mb-5 gap-3 flex-wrap">
            <div>
              <p className="text-xs font-body uppercase tracking-wide" style={{ color: '#9CA3AF' }}>entrada do diário</p>
              <p className="font-heading text-xl lowercase" style={{ color: pc.primary, fontWeight: 700 }}>{fmtDate(viewEntry.date)}</p>
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
                <label className="text-xs font-body" style={{ color: '#9CA3AF' }}>escrita livre em inglês</label>
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
              <div className="flex justify-end mt-2">
                <button onClick={() => autoSave()} className="btn-primary text-xs py-2 px-4">Salvar</button>
              </div>
            </div>

            {/* Corrections with auto-save */}
            <div>
              <label className="block text-xs font-body mb-1" style={{ color: '#9CA3AF' }}>correções da teacher (opcional)</label>
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
            <button onClick={() => { setMode('list'); setEditId(null) }} className="btn-secondary flex-1 justify-center">cancelar</button>
          </div>
        </div>
      </div>
    )
  }

  /* ── List ── */
  return (
    <div className="max-w-2xl">
      <div className="flex justify-end mb-5">
        <button onClick={() => { setForm({ ...EMPTY }); setEditId(null); setMode('form') }} className="btn-primary">
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
          {entries.map(entry => (
            <div key={entry.id} className="card p-5 group cursor-pointer"
              style={{ borderColor: pc.border }}
              onClick={() => { setViewId(entry.id); setMode('view') }}>
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="font-heading lowercase" style={{ color: pc.primary, fontWeight: 500 }}>{fmtDate(entry.date)}</p>
                  <p className="font-body text-sm mt-1 truncate" style={{ color: '#6B7280' }}>{entry.content?.replace(/<[^>]+>/g, '') || ''}</p>
                  {entry.corrections && (
                    <span className="text-xs font-body font-semibold mt-1 inline-block" style={{ color: '#D97706' }}>✏️ tem correções</span>
                  )}
                </div>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity ml-3 flex-shrink-0">
                  <button onClick={e => { e.stopPropagation(); startEdit(entry) }} className="btn-icon"><Pencil size={14} /></button>
                  <button onClick={e => { e.stopPropagation(); deleteEntry(entry.id) }} className="btn-icon danger"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

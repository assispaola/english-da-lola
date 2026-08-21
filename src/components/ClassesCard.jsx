import { useState, useMemo, useEffect } from 'react'
import { ChevronDown, ChevronUp, Pencil, Trash2, Plus, X, Check } from 'lucide-react'
import { COLOR_SETS, PAGE_COLORS } from '../utils/colors'
import { getUpcomingClasses, getPastClasses, addClass, updateClass, deleteClass, migrateLegacyNextClass } from '../utils/classes'

const TYPE_COLORS = { Grupo: COLOR_SETS.c2, VIP: COLOR_SETS.b3 }

function formatLong(dateStr) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
function formatShort(dateStr) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}
function daysUntil(dateStr) {
  return Math.ceil((new Date(`${dateStr}T12:00:00`) - new Date()) / 86400000)
}

function EditForm({ value, onSave, onCancel }) {
  const [date,  setDate]  = useState(value.date)
  const [topic, setTopic] = useState(value.topic)
  const [type,  setType]  = useState(value.type)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field" />
      <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="tópico" className="input-field" />
      <div className="flex gap-2">
        <select value={type} onChange={e => setType(e.target.value)} className="input-field flex-1">
          <option value="VIP">VIP</option><option value="Grupo">Grupo</option>
        </select>
        <button onClick={() => date && onSave({ date, topic, type })} disabled={!date} className="btn-icon" style={{ color: '#059669' }} title="salvar"><Check size={18} /></button>
        <button onClick={onCancel} className="btn-icon" style={{ color: '#9CA3AF' }} title="cancelar"><X size={18} /></button>
      </div>
    </div>
  )
}

function ClassRow({ cls, editing, onEdit, onSave, onCancelEdit, onDelete, faded }) {
  const tc = TYPE_COLORS[cls.type] || TYPE_COLORS.VIP

  if (editing) {
    return (
      <div className="rounded-xl p-3" style={{ backgroundColor: tc.accent, border: `1.5px solid ${tc.border}` }}>
        <EditForm value={cls} onSave={onSave} onCancel={onCancelEdit} />
      </div>
    )
  }

  return (
    <div className="rounded-xl p-3 flex items-center justify-between gap-3 font-body text-sm"
      style={{
        backgroundColor: faded ? '#F9FAFB' : tc.accent,
        border: `1.5px solid ${faded ? '#E5E7EB' : tc.border}`,
        opacity: faded ? 0.7 : 1,
      }}>
      <div className="min-w-0">
        <strong style={{ color: faded ? '#9CA3AF' : tc.text }}>{cls.type}</strong>
        {' — '}<span style={{ color: faded ? '#9CA3AF' : '#1A1A2E' }}>{cls.topic || 'sem tópico'}</span>
        <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{formatLong(cls.date)}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={onEdit} className="btn-icon" title="editar"><Pencil size={14} /></button>
        <button onClick={onDelete} className="btn-icon" style={{ color: '#DC2626' }} title="excluir"><Trash2 size={14} /></button>
      </div>
    </div>
  )
}

export default function ClassesCard({ onChange }) {
  const pc = PAGE_COLORS.dashboard
  const [tick, setTick] = useState(0)
  const refresh = () => { setTick(t => t + 1); onChange && onChange() }

  useEffect(() => { migrateLegacyNextClass(); refresh() }, [])

  const today = new Date().toISOString().split('T')[0]
  const upcoming = useMemo(() => getUpcomingClasses(today), [tick, today])
  const past     = useMemo(() => getPastClasses(today), [tick, today])
  const highlight = upcoming[0]
  const rest      = upcoming.slice(1)

  const [showAdd,     setShowAdd]     = useState(false)
  const [newDate,     setNewDate]     = useState('')
  const [newTopic,    setNewTopic]    = useState('')
  const [newType,     setNewType]     = useState('VIP')
  const [editingId,   setEditingId]   = useState(null)
  const [showPast,    setShowPast]    = useState(false)

  const submitAdd = () => {
    if (!newDate) return
    addClass({ date: newDate, topic: newTopic, type: newType })
    setNewDate(''); setNewTopic(''); setNewType('VIP')
    setShowAdd(false)
    refresh()
  }

  const saveEdit = (id, patch) => { updateClass(id, patch); setEditingId(null); refresh() }
  const remove   = (id) => { if (window.confirm('Excluir esta aula?')) { deleteClass(id); refresh() } }

  const du = highlight ? daysUntil(highlight.date) : null
  const hc = highlight ? (TYPE_COLORS[highlight.type] || TYPE_COLORS.VIP) : null

  return (
    <div className="card p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-xl lowercase" style={{ color: pc.secondary, fontWeight: 500 }}>próximas aulas 📅</h3>
        <button onClick={() => setShowAdd(v => !v)} className="btn-secondary gap-1.5" style={{ padding: '6px 12px' }}>
          <Plus size={14} /> nova aula
        </button>
      </div>

      {showAdd && (
        <div className="rounded-xl p-3 mb-4" style={{ backgroundColor: pc.accent, border: `1.5px solid ${pc.border}` }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
            <div>
              <label className="block text-xs font-body mb-1" style={{ color: '#9CA3AF' }}>data</label>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-body mb-1" style={{ color: '#9CA3AF' }}>tópico</label>
              <input type="text" value={newTopic} onChange={e => setNewTopic(e.target.value)} placeholder="ex: Present Continuous…" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-body mb-1" style={{ color: '#9CA3AF' }}>tipo</label>
              <div className="flex gap-2">
                <select value={newType} onChange={e => setNewType(e.target.value)} className="input-field flex-1">
                  <option value="VIP">VIP</option><option value="Grupo">Grupo</option>
                </select>
                <button onClick={submitAdd} disabled={!newDate} className="btn-primary" style={{ padding: '0 14px' }}>adicionar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!highlight && !showAdd && (
        <p className="font-body text-sm mb-2" style={{ color: '#9CA3AF' }}>nenhuma aula agendada — clique em "nova aula" para adicionar</p>
      )}

      {highlight && (
        editingId === highlight.id ? (
          <div className="rounded-xl p-3 mb-3" style={{ backgroundColor: hc.accent, border: `1.5px solid ${hc.border}` }}>
            <EditForm value={highlight} onSave={patch => saveEdit(highlight.id, patch)} onCancel={() => setEditingId(null)} />
          </div>
        ) : (
          <div className="rounded-xl p-3 mb-3" style={{ backgroundColor: hc.accent, border: `1.5px solid ${hc.border}` }}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 font-body text-sm">
                <strong style={{ color: hc.text }}>{highlight.type}</strong>
                {' — '}{highlight.topic || 'sem tópico'}
                {du !== null && (
                  <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: hc.border, color: hc.text }}>
                    {du <= 0 ? 'hoje!' : du === 1 ? 'amanhã!' : `em ${du} dias`}
                  </span>
                )}
                <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{formatLong(highlight.date)}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => setEditingId(highlight.id)} className="btn-icon" title="editar"><Pencil size={14} /></button>
                <button onClick={() => remove(highlight.id)} className="btn-icon" style={{ color: '#DC2626' }} title="excluir"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        )
      )}

      {rest.length > 0 && (
        <div className="flex flex-col gap-2 mb-2">
          {rest.map(cls => (
            <ClassRow key={cls.id} cls={cls}
              editing={editingId === cls.id}
              onEdit={() => setEditingId(cls.id)}
              onCancelEdit={() => setEditingId(null)}
              onSave={patch => saveEdit(cls.id, patch)}
              onDelete={() => remove(cls.id)} />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: '1.5px solid #F3F4F6' }}>
          <button onClick={() => setShowPast(v => !v)} className="flex items-center gap-1.5 font-body text-xs" style={{ color: '#9CA3AF' }}>
            {showPast ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            aulas passadas ({past.length})
          </button>
          {showPast && (
            <div className="flex flex-col gap-2 mt-2">
              {past.map(cls => (
                <ClassRow key={cls.id} cls={cls} faded
                  editing={editingId === cls.id}
                  onEdit={() => setEditingId(cls.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onSave={patch => saveEdit(cls.id, patch)}
                  onDelete={() => remove(cls.id)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

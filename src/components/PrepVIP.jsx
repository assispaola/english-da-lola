import { useState } from 'react'
import { Plus, X, Check, Trash2 } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useAutoSave } from '../hooks/useAutoSave'
import SaveStatus from './SaveStatus'
import { PAGE_COLORS } from '../utils/colors'

const EMPTY_SESSION = { date: '', topic: '', doubts: [], vocabulary: [], questions: [] }
const pc = PAGE_COLORS.vip

function ChecklistSection({ title, emoji, items, onAdd, onToggle, onDelete, readOnly }) {
  const [newItem, setNewItem] = useState('')
  const [saveStatus, setSaveStatus] = useState(null)

  const handleAdd = () => {
    if (!newItem.trim()) return
    onAdd(newItem.trim())
    setNewItem('')
    // Show save status
    setSaveStatus('saving')
    setTimeout(() => { setSaveStatus('saved'); setTimeout(() => setSaveStatus(null), 2000) }, 300)
  }

  return (
    <div className="rounded-xl p-4 border-[1.5px] flex flex-col" style={{ backgroundColor: pc.accent, borderColor: pc.border }}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-heading text-base lowercase" style={{ color: pc.primary, fontWeight: 500 }}>
          {emoji} {title}
        </h4>
        {!readOnly && <SaveStatus status={saveStatus} />}
      </div>

      {!readOnly && (
        <div className="flex gap-2 mb-3">
          <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="adicionar…"
            className="flex-1 text-sm font-body focus:outline-none bg-white rounded-lg px-3 py-2"
            style={{ border: `1.5px solid ${pc.border}`, minHeight: '40px' }} />
          <button onClick={handleAdd}
            className="flex items-center justify-center px-3 text-white font-bold transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${pc.primary}, ${pc.secondary})`, minHeight: '40px', minWidth: '40px', borderRadius: '8px' }}>
            <Plus size={16} />
          </button>
        </div>
      )}

      <div className="space-y-2 flex-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 group">
            <button onClick={() => !readOnly && onToggle(i)}
              className="w-5 h-5 flex-shrink-0 flex items-center justify-center transition-all"
              style={{
                borderRadius: '6px',
                border: `2px solid ${item.done ? '#26C6A0' : pc.border}`,
                backgroundColor: item.done ? '#26C6A0' : 'white',
                cursor: readOnly ? 'default' : 'pointer',
              }}>
              {item.done && <Check size={10} color="white" />}
            </button>
            <span className={`font-body text-sm flex-1 ${item.done ? 'line-through' : ''}`}
              style={{ color: item.done ? '#9CA3AF' : '#1A1A2E' }}>{item.text}</span>
            {!readOnly && (
              <button onClick={() => onDelete(i)}
                className="opacity-0 group-hover:opacity-100 transition-opacity btn-icon danger" style={{ minWidth: '28px', minHeight: '28px' }}>
                <X size={12} />
              </button>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs font-body italic" style={{ color: '#9CA3AF' }}>nenhum item ainda</p>
        )}
      </div>
    </div>
  )
}

export default function PrepVIP() {
  const [sessions, setSessions] = useLocalStorage('ej_vip_sessions', [], 'vipSessions')
  const [current,  setCurrent]  = useLocalStorage('ej_vip_current', { ...EMPTY_SESSION }, 'vipCurrent')
  const [view,     setView]     = useState('current')

  const updateSection = (sec, items) => setCurrent({ ...current, [sec]: items })
  const addItem    = (sec, text) => updateSection(sec, [...(current[sec] || []), { text, done: false }])
  const toggleItem = (sec, idx)  => { const arr = [...(current[sec] || [])]; arr[idx] = { ...arr[idx], done: !arr[idx].done }; updateSection(sec, arr) }
  const deleteItem = (sec, idx)  => updateSection(sec, (current[sec] || []).filter((_, i) => i !== idx))

  const saveSession = () => {
    if (!current.topic) return
    setSessions([{ ...current, id: Date.now(), savedAt: new Date().toISOString() }, ...sessions])
    setCurrent({ ...EMPTY_SESSION })
  }

  const deleteSession = (id) => { if (window.confirm('Excluir sessão?')) setSessions(sessions.filter(s => s.id !== id)) }

  // auto-save for topic field
  const { save: saveTopic, status: topicStatus } = useAutoSave((val) => setCurrent(prev => ({ ...prev, topic: val })))

  const sp = (sec) => ({
    items: current[sec] || [], onAdd: t => addItem(sec, t),
    onToggle: i => toggleItem(sec, i), onDelete: i => deleteItem(sec, i),
  })

  return (
    <div>
      <div className="flex gap-3 mb-5">
        {[['current', 'aula atual'], ['history', `histórico (${sessions.length})`]].map(([v, label]) => (
          <button key={v} onClick={() => setView(v)}
            className="px-4 py-2 font-body text-sm font-semibold transition-all"
            style={{
              borderRadius: '8px',
              background: view === v ? `linear-gradient(135deg, ${pc.primary}, ${pc.secondary})` : 'transparent',
              color: view === v ? 'white' : pc.primary,
              border: view === v ? 'none' : `2px solid ${pc.primary}`,
              boxShadow: view === v ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
            }}>
            {label}
          </button>
        ))}
      </div>

      {view === 'current' ? (
        <div className="space-y-4 max-w-3xl">
          <div className="card p-5" style={{ borderColor: pc.border }}>
            <h3 className="font-heading text-lg mb-4 lowercase" style={{ color: pc.primary, fontWeight: 500 }}>vip class prep ⭐</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-body mb-1 block" style={{ color: '#9CA3AF' }}>data da aula</label>
                <input type="date" value={current.date}
                  onChange={e => setCurrent({ ...current, date: e.target.value })}
                  className="input-field" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-body" style={{ color: '#9CA3AF' }}>tópico</label>
                  <SaveStatus status={topicStatus} />
                </div>
                <input type="text" value={current.topic}
                  onChange={e => saveTopic(e.target.value)}
                  placeholder="ex: Present Continuous…"
                  className="input-field" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ChecklistSection title="doubts"               emoji="❓" {...sp('doubts')} />
            <ChecklistSection title="topic vocabulary"     emoji="📝" {...sp('vocabulary')} />
            <ChecklistSection title="questions for teacher" emoji="🙋" {...sp('questions')} />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs font-body" style={{ color: '#9CA3AF' }}>
              {(current.doubts?.length || 0) + (current.vocabulary?.length || 0) + (current.questions?.length || 0)} itens registrados
            </p>
            <button onClick={saveSession} disabled={!current.topic} className="btn-primary">
              salvar no histórico
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {sessions.length === 0 ? (
            <div className="text-center py-14">
              <div className="text-6xl mb-4">⭐</div>
              <p className="font-heading text-xl lowercase" style={{ color: '#D1D5DB', fontWeight: 500 }}>no classes in history ⭐</p>
            </div>
          ) : sessions.map(session => (
            <div key={session.id} className="card p-5" style={{ borderColor: pc.border }}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-heading text-lg lowercase" style={{ color: pc.primary, fontWeight: 500 }}>{session.topic}</p>
                  {session.date && (
                    <p className="text-sm font-body" style={{ color: '#9CA3AF' }}>
                      {new Date(session.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="pill" style={{ backgroundColor: pc.accent, color: pc.primary, fontSize: '11px' }}>
                    {(session.doubts || []).filter(i => i.done).length}/{(session.doubts || []).length} dúvidas
                  </span>
                  <button onClick={() => deleteSession(session.id)} className="btn-icon danger"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ChecklistSection title="doubts"     emoji="❓" items={session.doubts    || []} onAdd={() => {}} onToggle={() => {}} onDelete={() => {}} readOnly />
                <ChecklistSection title="vocabulary" emoji="📝" items={session.vocabulary || []} onAdd={() => {}} onToggle={() => {}} onDelete={() => {}} readOnly />
                <ChecklistSection title="questions"  emoji="🙋" items={session.questions  || []} onAdd={() => {}} onToggle={() => {}} onDelete={() => {}} readOnly />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

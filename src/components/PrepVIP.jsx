import { useState } from 'react'
import { Plus, X, Check, Trash2 } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const EMPTY_SESSION = { date: '', topic: '', doubts: [], vocabulary: [], questions: [] }

function ChecklistSection({ title, emoji, items, onAdd, onToggle, onDelete, readOnly }) {
  const [newItem, setNewItem] = useState('')

  const handleAdd = () => {
    if (!newItem.trim()) return
    onAdd(newItem.trim()); setNewItem('')
  }

  return (
    <div className="rounded-xl p-4 border-[1.5px] flex flex-col" style={{ backgroundColor:'#FFF0F6', borderColor:'#F8BBD0' }}>
      <h4 className="font-heading text-base mb-3 lowercase" style={{ color:'#C2185B', fontWeight:500 }}>
        {emoji} {title}
      </h4>

      {!readOnly && (
        <div className="flex gap-2 mb-3">
          <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="adicionar…"
            className="flex-1 text-sm font-body focus:outline-none bg-white rounded-xl px-3 py-2"
            style={{ border:'1.5px solid #F8BBD0', minHeight:'40px' }} />
          <button onClick={handleAdd}
            className="flex items-center justify-center px-3 rounded-xl text-white font-bold transition-all hover:opacity-90"
            style={{ background:'linear-gradient(135deg,#E91E8C,#C2185B)', minHeight:'40px', minWidth:'40px' }}>
            <Plus size={16} />
          </button>
        </div>
      )}

      <div className="space-y-2 flex-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 group">
            <button onClick={() => !readOnly && onToggle(i)}
              className="w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all"
              style={item.done
                ? { backgroundColor:'#26C6A0', borderColor:'#26C6A0', color:'white' }
                : { borderColor:'#F8BBD0', backgroundColor:'white', cursor: readOnly ? 'default' : 'pointer' }}>
              {item.done && <Check size={10} />}
            </button>
            <span className={`font-body text-sm flex-1 ${item.done ? 'line-through' : ''}`}
              style={{ color: item.done ? '#9CA3AF' : '#1A1A2E' }}>{item.text}</span>
            {!readOnly && (
              <button onClick={() => onDelete(i)}
                className="opacity-0 group-hover:opacity-100 transition-opacity btn-icon danger" style={{ minWidth:'28px', minHeight:'28px' }}>
                <X size={12} />
              </button>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs font-body italic" style={{ color:'#9CA3AF' }}>nenhum item ainda</p>
        )}
      </div>
    </div>
  )
}

export default function PrepVIP() {
  const [sessions, setSessions] = useLocalStorage('ej_vip_sessions', [])
  const [current,  setCurrent]  = useLocalStorage('ej_vip_current', { ...EMPTY_SESSION })
  const [view,     setView]     = useState('current')

  const updateSection = (sec, items) => setCurrent({ ...current, [sec]: items })
  const addItem    = (sec, text) => updateSection(sec, [...(current[sec] || []), { text, done: false }])
  const toggleItem = (sec, idx)  => { const arr = [...(current[sec] || [])]; arr[idx] = { ...arr[idx], done: !arr[idx].done }; updateSection(sec, arr) }
  const deleteItem = (sec, idx)  => updateSection(sec, (current[sec] || []).filter((_,i) => i !== idx))

  const saveSession = () => {
    if (!current.topic) return
    setSessions([{ ...current, id: Date.now(), savedAt: new Date().toISOString() }, ...sessions])
    setCurrent({ ...EMPTY_SESSION })
  }

  const deleteSession = (id) => { if (window.confirm('Excluir sessão?')) setSessions(sessions.filter(s => s.id !== id)) }

  const sp = (sec) => ({
    items: current[sec] || [], onAdd: t => addItem(sec, t),
    onToggle: i => toggleItem(sec, i), onDelete: i => deleteItem(sec, i),
  })

  return (
    <div>
      <div className="flex gap-3 mb-5">
        {[['current','aula atual'], ['history',`histórico (${sessions.length})`]].map(([v, label]) => (
          <button key={v} onClick={() => setView(v)}
            className="px-4 py-2 rounded-full font-body text-sm font-bold transition-all"
            style={view === v
              ? { background:'linear-gradient(135deg,#E91E8C,#C2185B)', color:'white', boxShadow:'0 2px 8px rgba(233,30,140,0.30)' }
              : { backgroundColor:'#FCE4EC', color:'#C2185B' }}>
            {label}
          </button>
        ))}
      </div>

      {view === 'current' ? (
        <div className="space-y-4 max-w-3xl">
          <div className="card p-5">
            <h3 className="font-heading text-lg mb-4 lowercase" style={{ color:'#C2185B', fontWeight:500 }}>vip class prep ⭐</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-body mb-1 block" style={{ color:'#9CA3AF' }}>data da aula</label>
                <input type="date" value={current.date} onChange={e => setCurrent({ ...current, date: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-xs font-body mb-1 block" style={{ color:'#9CA3AF' }}>tópico</label>
                <input type="text" value={current.topic} onChange={e => setCurrent({ ...current, topic: e.target.value })}
                  placeholder="ex: Present Continuous…" className="input-field" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ChecklistSection title="doubts"              emoji="❓" {...sp('doubts')} />
            <ChecklistSection title="topic vocabulary"    emoji="📝" {...sp('vocabulary')} />
            <ChecklistSection title="questions for teacher" emoji="🙋" {...sp('questions')} />
          </div>

          <div className="flex justify-end">
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
              <p className="font-heading text-xl lowercase" style={{ color:'#F8BBD0', fontWeight:500 }}>no classes in history ⭐</p>
            </div>
          ) : sessions.map(session => (
            <div key={session.id} className="card p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-heading text-lg lowercase" style={{ color:'#C2185B', fontWeight:500 }}>{session.topic}</p>
                  {session.date && (
                    <p className="text-sm font-body" style={{ color:'#9CA3AF' }}>
                      {new Date(session.date + 'T12:00:00').toLocaleDateString('pt-BR', { day:'numeric', month:'long', year:'numeric' })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="pill" style={{ backgroundColor:'#FCE4EC', color:'#C2185B', fontSize:'11px' }}>
                    {(session.doubts||[]).filter(i=>i.done).length}/{(session.doubts||[]).length} dúvidas
                  </span>
                  <button onClick={() => deleteSession(session.id)} className="btn-icon danger"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ChecklistSection title="doubts"           emoji="❓" items={session.doubts||[]}    onAdd={()=>{}} onToggle={()=>{}} onDelete={()=>{}} readOnly />
                <ChecklistSection title="vocabulary"       emoji="📝" items={session.vocabulary||[]} onAdd={()=>{}} onToggle={()=>{}} onDelete={()=>{}} readOnly />
                <ChecklistSection title="questions"        emoji="🙋" items={session.questions||[]}  onAdd={()=>{}} onToggle={()=>{}} onDelete={()=>{}} readOnly />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

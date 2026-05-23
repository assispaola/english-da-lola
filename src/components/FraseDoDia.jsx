import { useState } from 'react'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const CATEGORIES = ['geral', 'saudações', 'cotidiano', 'trabalho', 'gramática', 'expressão idiomática']

const CAT_COLORS = {
  'geral':                { bg:'#FCE4EC', color:'#C2185B' },
  'saudações':            { bg:'#EDE7F6', color:'#7C3AED' },
  'cotidiano':            { bg:'#FFF3E0', color:'#FF6B35' },
  'trabalho':             { bg:'#DBEAFE', color:'#2563EB' },
  'gramática':            { bg:'#D1FAE5', color:'#059669' },
  'expressão idiomática': { bg:'#FEF3C7', color:'#D97706' },
}

const EMPTY = { english: '', portuguese: '', category: 'geral' }

export default function FraseDoDia() {
  const [phrases, setPhrases] = useLocalStorage('ej_frases', [])
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState(EMPTY)
  const [editId,   setEditId]   = useState(null)

  const today    = new Date().toISOString().split('T')[0]
  const dayIndex = Math.floor(Date.now() / 86400000)
  const active   = phrases.filter(p => !p.mastered)
  const todayPhrase = active.length > 0 ? active[dayIndex % active.length] : null

  const savePhrase = () => {
    if (!form.english.trim() || !form.portuguese.trim()) return
    if (editId) {
      setPhrases(phrases.map(p => p.id === editId ? { ...p, ...form } : p))
    } else {
      setPhrases([...phrases, { ...form, id: Date.now(), mastered: false, createdAt: today }])
    }
    setForm(EMPTY); setEditId(null); setShowForm(false)
  }

  const markMastered = (id) => setPhrases(phrases.map(p => p.id === id ? { ...p, mastered: true }  : p))
  const unMastered   = (id) => setPhrases(phrases.map(p => p.id === id ? { ...p, mastered: false } : p))
  const deletePhrase = (id) => { if (window.confirm('Excluir esta frase?')) setPhrases(phrases.filter(p => p.id !== id)) }
  const startEdit    = (phrase) => {
    setForm({ english: phrase.english, portuguese: phrase.portuguese, category: phrase.category })
    setEditId(phrase.id); setShowForm(true)
  }

  return (
    <div className="max-w-3xl">
      {/* Today's phrase */}
      {todayPhrase ? (
        <div className="relative overflow-hidden rounded-2xl p-7 mb-5 text-white shadow-lg"
          style={{ background:'linear-gradient(135deg, #E91E8C 0%, #C2185B 100%)' }}>
          {/* decoration blob */}
          <svg className="absolute -right-8 -top-8 opacity-15 w-40 h-40 pointer-events-none" viewBox="0 0 200 200">
            <path d="M44,-65C55,-52,61,-36,67,-19C73,-2,79,15,76,31C73,47,60,62,45,72C29,82,10,86,-8,82C-25,78,-40,67,-53,53C-66,39,-76,22,-77,4C-78,-14,-70,-33,-58,-48C-45,-63,-28,-74,-10,-73C8,-72,33,-78,44,-65Z" fill="white"/>
          </svg>
          <div className="relative z-10">
            <p className="font-body text-pink-200 text-xs uppercase tracking-widest mb-3">💬 frase do dia</p>
            <p className="font-heading text-3xl leading-snug mb-3" style={{ fontWeight:700, color:'white' }}>{todayPhrase.english}</p>
            <p className="font-body text-lg" style={{ color:'rgba(255,255,255,0.85)' }}>{todayPhrase.portuguese}</p>
            <div className="flex items-center gap-3 mt-5 flex-wrap">
              <span className="pill text-xs px-3" style={{ backgroundColor:'rgba(255,255,255,0.2)', color:'white' }}>
                {todayPhrase.category}
              </span>
              <button onClick={() => markMastered(todayPhrase.id)}
                className="font-body font-bold text-sm px-4 py-2 rounded-full transition-all hover:opacity-90"
                style={{ backgroundColor:'rgba(255,255,255,0.2)', color:'white', border:'1.5px solid rgba(255,255,255,0.4)', minHeight:'40px' }}>
                ✅ já sei de cor!
              </button>
            </div>
          </div>
        </div>
      ) : phrases.length === 0 ? (
        <div className="rounded-2xl p-8 mb-5 text-center border-2 border-dashed" style={{ backgroundColor:'#FFF0F6', borderColor:'#F8BBD0' }}>
          <div className="text-5xl mb-3">💬</div>
          <p className="font-heading text-xl lowercase" style={{ color:'#C2185B', fontWeight:500 }}>add phrases to start practicing!</p>
        </div>
      ) : (
        <div className="rounded-2xl p-8 mb-5 text-center border-2" style={{ backgroundColor:'#E0F7FA', borderColor:'#80DEEA' }}>
          <div className="text-5xl mb-3">🏆</div>
          <p className="font-heading text-xl lowercase" style={{ color:'#00838F', fontWeight:500 }}>you mastered all phrases!</p>
          <p className="font-body text-sm mt-1" style={{ color:'#006064' }}>adicione novas frases para continuar praticando</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm font-body" style={{ color:'#9CA3AF' }}>
          {active.length} ativa{active.length !== 1 ? 's' : ''} · {phrases.filter(p => p.mastered).length} dominada{phrases.filter(p => p.mastered).length !== 1 ? 's' : ''}
        </p>
        <button onClick={() => { setShowForm(!showForm); setForm(EMPTY); setEditId(null) }} className="btn-primary">
          <Plus size={16} /> nova frase
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-5 mb-5">
          <h3 className="font-heading text-lg mb-4 lowercase" style={{ color:'#C2185B', fontWeight:500 }}>
            {editId ? 'edit phrase' : 'new phrase'}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-body mb-1 block" style={{ color:'#9CA3AF' }}>frase em inglês *</label>
              <input type="text" value={form.english} onChange={e => setForm({ ...form, english: e.target.value })}
                className="input-field" placeholder="ex: How are you doing?" autoFocus />
            </div>
            <div>
              <label className="text-xs font-body mb-1 block" style={{ color:'#9CA3AF' }}>tradução em português *</label>
              <input type="text" value={form.portuguese} onChange={e => setForm({ ...form, portuguese: e.target.value })}
                className="input-field" placeholder="ex: Como você está?" />
            </div>
            <div>
              <label className="text-xs font-body mb-1 block" style={{ color:'#9CA3AF' }}>categoria</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={savePhrase} className="btn-primary flex-1 justify-center">salvar</button>
            <button onClick={() => { setShowForm(false); setEditId(null) }} className="btn-secondary flex-1 justify-center">cancelar</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {phrases.map(phrase => {
          const cat = CAT_COLORS[phrase.category] || { bg:'#F3F4F6', color:'#6B7280' }
          return (
            <div key={phrase.id}
              className={`rounded-2xl p-4 border-[1.5px] transition-all hover:scale-[1.01] group ${phrase.mastered ? 'opacity-60' : ''}`}
              style={{ backgroundColor: phrase.mastered ? '#F9FAFB' : 'white', borderColor:'#F8BBD0',
                boxShadow: phrase.mastered ? 'none' : '0 2px 8px rgba(233,30,140,0.06)' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="pill" style={{ backgroundColor: cat.bg, color: cat.color }}>{phrase.category}</span>
                    {phrase.mastered && <span className="pill text-xs" style={{ backgroundColor:'#D1FAE5', color:'#059669' }}>✅ dominada</span>}
                    {todayPhrase?.id === phrase.id && !phrase.mastered && (
                      <span className="pill text-xs" style={{ backgroundColor:'#FCE4EC', color:'#E91E8C' }}>📅 hoje</span>
                    )}
                  </div>
                  <p className="font-heading text-base lowercase" style={{ color:'#C2185B', fontWeight:500 }}>{phrase.english}</p>
                  <p className="font-body text-sm" style={{ color:'#6B7280' }}>{phrase.portuguese}</p>
                </div>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  {phrase.mastered
                    ? <button onClick={() => unMastered(phrase.id)} className="btn-icon" title="remover dominada"><Star size={14} /></button>
                    : <button onClick={() => markMastered(phrase.id)} className="btn-icon" title="marcar dominada"><Star size={14} /></button>
                  }
                  <button onClick={() => startEdit(phrase)} className="btn-icon"><Pencil size={14} /></button>
                  <button onClick={() => deletePhrase(phrase.id)} className="btn-icon danger"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

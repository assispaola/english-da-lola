import { useState } from 'react'
import { Plus, Pencil, Trash2, Play } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { recordActivity } from '../utils/activity'
import { getCardColorSet } from '../utils/colors'

const CATEGORIES = ['gramática', 'vocabulário', 'expressões', 'phrasal verbs']

const CAT_COLORS = {
  'gramática':     { bg: '#FCE4EC', color: '#C2185B' },
  'vocabulário':   { bg: '#FFF3E0', color: '#FF6B35' },
  'expressões':    { bg: '#E0F7FA', color: '#26C6A0' },
  'phrasal verbs': { bg: '#EDE7F6', color: '#7C3AED' },
}

const EMPTY = { front: '', back: '', category: 'vocabulário' }

function Badge({ cat }) {
  const c = CAT_COLORS[cat] || { bg: '#F3F4F6', color: '#6B7280' }
  return <span className="pill" style={{ backgroundColor: c.bg, color: c.color }}>{cat}</span>
}

export default function Flashcards() {
  const [cards,  setCards]  = useLocalStorage('ej_flashcards', [])
  const [mode,   setMode]   = useState('list')
  const [form,   setForm]   = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [filter, setFilter] = useState('todas')
  const [reviewCards, setReviewCards] = useState([])
  const [idx,      setIdx]      = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [stats,    setStats]    = useState({ sei: 0, mais_ou_menos: 0, nao_sei: 0 })

  const today    = new Date().toISOString().split('T')[0]
  const filtered = filter === 'todas' ? cards : cards.filter(c => c.category === filter)

  const saveCard = () => {
    if (!form.front.trim() || !form.back.trim()) return
    if (editId) {
      setCards(cards.map(c => c.id === editId ? { ...c, ...form } : c))
    } else {
      setCards([...cards, { ...form, id: Date.now(), reviewCount: 0, lastReview: null, confidence: null, createdAt: today }])
    }
    setForm(EMPTY); setEditId(null); setMode('list')
  }

  const startEdit = (card) => {
    setForm({ front: card.front, back: card.back, category: card.category })
    setEditId(card.id); setMode('form')
  }

  const deleteCard = (id) => {
    if (window.confirm('Excluir este flashcard?')) setCards(cards.filter(c => c.id !== id))
  }

  const startReview = () => {
    if (!filtered.length) return
    setReviewCards([...filtered].sort(() => Math.random() - 0.5))
    setIdx(0); setRevealed(false)
    setStats({ sei: 0, mais_ou_menos: 0, nao_sei: 0 })
    setMode('review'); recordActivity()
  }

  const rate = (confidence) => {
    const card = reviewCards[idx]
    setCards(cards.map(c => c.id === card.id ? { ...c, reviewCount: c.reviewCount + 1, lastReview: today, confidence } : c))
    setStats(prev => ({ ...prev, [confidence]: prev[confidence] + 1 }))
    if (idx + 1 < reviewCards.length) { setIdx(idx + 1); setRevealed(false) }
    else setMode('done')
  }

  /* ── Review done ── */
  if (mode === 'done') {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="card p-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="font-heading text-2xl mb-2 lowercase" style={{ color: '#C2185B', fontWeight: 700 }}>review complete!</h2>
          <p className="font-body mb-6" style={{ color: '#9CA3AF' }}>{reviewCards.length} cards revisados</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { key: 'sei',           label: '✅ sei',           bg: '#D1FAE5', c: '#059669' },
              { key: 'mais_ou_menos', label: '🤔 mais ou menos', bg: '#FEF3C7', c: '#D97706' },
              { key: 'nao_sei',       label: '❌ não sei',       bg: '#FEE2E2', c: '#DC2626' },
            ].map(s => (
              <div key={s.key} className="rounded-xl p-3" style={{ backgroundColor: s.bg }}>
                <div className="font-heading text-2xl" style={{ color: s.c }}>{stats[s.key]}</div>
                <div className="text-xs font-body mt-0.5" style={{ color: s.c }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setMode('list')} className="btn-primary w-full justify-center">voltar para lista</button>
        </div>
      </div>
    )
  }

  /* ── Review mode ── */
  if (mode === 'review') {
    const card = reviewCards[idx]
    const cs   = getCardColorSet(idx)
    return (
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-3">
          <button onClick={() => setMode('list')} className="btn-secondary text-sm py-2 px-4">← voltar</button>
          <span className="font-body text-sm" style={{ color: '#9CA3AF' }}>{idx + 1} / {reviewCards.length}</span>
        </div>
        <div className="overflow-hidden mb-6" style={{ height: '10px', borderRadius: '50px', backgroundColor: '#E5E7EB' }}>
          <div style={{ height: '100%', borderRadius: '50px', width: `${(idx / reviewCards.length) * 100}%`, backgroundColor: cs.primary, transition: 'width 0.4s ease' }} />
        </div>

        <div className="card p-8 text-center cursor-pointer"
          style={{ border: `2px solid ${cs.border}` }}
          onClick={() => !revealed && setRevealed(true)}>
          <Badge cat={card.category} />
          <div className="mt-6 mb-4">
            <p className="text-xs font-body uppercase tracking-wide mb-2" style={{ color: '#9CA3AF' }}>inglês</p>
            <p className="font-heading text-3xl" style={{ color: cs.primary, fontWeight: 700 }}>{card.front}</p>
          </div>
          {!revealed ? (
            <div className="mt-8 p-4 rounded-xl border-2 border-dashed" style={{ borderColor: cs.border, backgroundColor: cs.accent }}>
              <p className="font-body text-sm" style={{ color: cs.secondary }}>toque para revelar ✨</p>
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-xs font-body uppercase tracking-wide mb-2" style={{ color: '#9CA3AF' }}>português</p>
              <p className="font-heading text-2xl mb-8" style={{ color: '#1A1A2E', fontWeight: 500 }}>{card.back}</p>
              <div className="flex gap-2">
                {[
                  { conf: 'nao_sei',       label: '❌ não sei',       bg: '#FEE2E2', border: '#FECACA', c: '#DC2626' },
                  { conf: 'mais_ou_menos', label: '🤔 mais ou menos', bg: '#FEF3C7', border: '#FDE68A', c: '#D97706' },
                  { conf: 'sei',           label: '✅ sei',           bg: '#D1FAE5', border: '#A7F3D0', c: '#059669' },
                ].map(b => (
                  <button key={b.conf} onClick={() => rate(b.conf)}
                    className="flex-1 font-body font-semibold text-sm py-3 transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: b.bg, border: `2px solid ${b.border}`, color: b.c, minHeight: '44px', borderRadius: '8px' }}>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ── Form mode ── */
  if (mode === 'form') {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card p-6">
          <h2 className="font-heading text-xl mb-5 lowercase" style={{ color: '#C2185B', fontWeight: 500 }}>
            {editId ? 'edit flashcard' : 'new flashcard'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-body mb-1" style={{ color: '#9CA3AF' }}>inglês (frente)</label>
              <input type="text" value={form.front} onChange={e => setForm({ ...form, front: e.target.value })}
                placeholder="ex: to be" className="input-field" autoFocus />
            </div>
            <div>
              <label className="block text-xs font-body mb-1" style={{ color: '#9CA3AF' }}>português (verso)</label>
              <input type="text" value={form.back} onChange={e => setForm({ ...form, back: e.target.value })}
                placeholder="ex: ser / estar" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-body mb-1" style={{ color: '#9CA3AF' }}>categoria</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={saveCard} className="btn-primary flex-1 justify-center">salvar</button>
            <button onClick={() => { setMode('list'); setForm(EMPTY); setEditId(null) }} className="btn-secondary flex-1 justify-center">cancelar</button>
          </div>
        </div>
      </div>
    )
  }

  /* ── List mode ── */
  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-5 justify-between items-center">
        <div className="flex gap-2 flex-wrap">
          {['todas', ...CATEGORIES].map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className="px-3 py-1.5 text-sm font-body font-semibold transition-colors"
              style={{
                borderRadius: '8px',
                backgroundColor: filter === cat ? '#E91E8C' : '#F3F4F6',
                color: filter === cat ? 'white' : '#6B7280',
              }}>
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {filtered.length > 0 && (
            <button onClick={startReview}
              className="inline-flex items-center gap-2 font-body font-semibold text-sm text-white px-4 py-2 transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#26C6A0,#00897B)', minHeight: '44px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
              <Play size={14} /> revisar ({filtered.length})
            </button>
          )}
          <button onClick={() => { setMode('form'); setForm(EMPTY); setEditId(null) }} className="btn-primary">
            <Plus size={16} /> novo card
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🃏</div>
          <p className="font-heading text-xl lowercase" style={{ color: '#D1D5DB', fontWeight: 500 }}>no flashcards yet 🃏</p>
          <p className="font-body text-sm mt-2" style={{ color: '#9CA3AF' }}>crie seu primeiro card acima!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((card, i) => {
            const cs = getCardColorSet(i)
            return (
              <div key={card.id} className="group p-5 transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: cs.accent,
                  border: `2px solid ${cs.border}`,
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
                }}>
                <div className="flex justify-between items-start mb-3">
                  <Badge cat={card.category} />
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(card)} className="btn-icon"><Pencil size={14} /></button>
                    <button onClick={() => deleteCard(card.id)} className="btn-icon danger"><Trash2 size={14} /></button>
                  </div>
                </div>
                <p className="font-heading text-lg" style={{ color: cs.primary, fontWeight: 500 }}>{card.front}</p>
                <p className="font-body text-sm mt-1" style={{ color: cs.text }}>{card.back}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-body" style={{ color: '#9CA3AF' }}>revisado {card.reviewCount}×</span>
                  {card.confidence && (
                    <span>{card.confidence === 'sei' ? '✅' : card.confidence === 'mais_ou_menos' ? '🤔' : '❌'}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

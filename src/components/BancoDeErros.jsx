import { useState } from 'react'
import { Plus, X, Check } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { PAGE_COLORS } from '../utils/colors'
import RichTextEditor from './RichTextEditor'

const CATEGORIES = ['gramática', 'vocabulário', 'pronúncia', 'expressões', 'escrita', 'outro']

const CAT_COLORS = {
  'gramática':   { bg: '#FCE4EC', color: '#C2185B' },
  'vocabulário': { bg: '#FFF3E0', color: '#FF6B35' },
  'pronúncia':   { bg: '#E0F7FA', color: '#26C6A0' },
  'expressões':  { bg: '#EDE7F6', color: '#7C3AED' },
  'escrita':     { bg: '#E8F5E9', color: '#2E7D32' },
  'outro':       { bg: '#F3F4F6', color: '#6B7280' },
}

const pc = PAGE_COLORS.erros

export default function BancoDeErros() {
  const [errors,   setErrors]   = useLocalStorage('ej_erros', [])
  const [form,     setForm]     = useState({ text: '', category: 'gramática' })
  const [showForm, setShowForm] = useState(false)
  const [filter,   setFilter]   = useState('todos')

  const addError = () => {
    if (!form.text.trim()) return
    setErrors([{ id: Date.now(), text: form.text, category: form.category, resolved: false,
      createdAt: new Date().toISOString().split('T')[0] }, ...errors])
    setForm({ text: '', category: 'gramática' }); setShowForm(false)
  }

  const toggleResolved = (id) => setErrors(errors.map(e => e.id === id ? { ...e, resolved: !e.resolved } : e))
  const deleteError    = (id) => setErrors(errors.filter(e => e.id !== id))

  const FILTERS = ['todos', 'pendentes', 'resolvidos', ...CATEGORIES]
  const filtered = filter === 'pendentes'  ? errors.filter(e => !e.resolved)
                 : filter === 'resolvidos' ? errors.filter(e =>  e.resolved)
                 : filter === 'todos'      ? errors
                 : errors.filter(e => e.category === filter)

  const pending = errors.filter(e => !e.resolved).length

  return (
    <div className="max-w-3xl">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { value: pending,                 label: 'pendentes',  color: pc.primary,   bg: pc.accent  },
          { value: errors.length - pending, label: 'resolvidos', color: '#26C6A0',    bg: '#E0F7FA'  },
          { value: errors.length,           label: 'total',      color: pc.secondary, bg: '#F9FAFB'  },
        ].map((s, i) => (
          <div key={i} className="card p-4 text-center">
            <div className="font-heading text-3xl" style={{ color: s.color }}>{s.value}</div>
            <p className="font-body text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + Add */}
      <div className="flex flex-wrap gap-2 mb-5 justify-between items-start">
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 text-xs font-body font-semibold transition-colors"
              style={{
                borderRadius: '8px',
                backgroundColor: filter === f ? pc.primary : '#F3F4F6',
                color: filter === f ? 'white' : '#6B7280',
              }}>
              {f}
            </button>
          ))}
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
              value={form.text}
              onChange={val => setForm({ ...form, text: val })}
              placeholder="Descreva o erro (ex: confundo 'since' e 'for' em durações…)"
              rows={3}
              accentColor={pc.accent}
              borderColor={pc.border}
              primaryColor={pc.primary}
            />
          </div>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field mb-3">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex gap-3">
            <button onClick={addError} className="btn-primary flex-1 justify-center">salvar</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">cancelar</button>
          </div>
        </div>
      )}

      {/* Error list */}
      {filtered.length === 0 ? (
        <div className="text-center py-14">
          <div className="text-6xl mb-4">🎉</div>
          <p className="font-heading text-xl lowercase" style={{ color: '#D1D5DB', fontWeight: 500 }}>
            {filter === 'resolvidos' ? 'no resolved errors yet' : 'all clear!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(error => {
            const cat = CAT_COLORS[error.category] || { bg: '#F3F4F6', color: '#6B7280' }
            return (
              <div key={error.id}
                className={`p-4 transition-all hover:scale-[1.01] border-[1.5px] ${error.resolved ? 'opacity-60' : ''}`}
                style={{
                  borderRadius: '12px',
                  backgroundColor: error.resolved ? '#F9FAFB' : pc.accent,
                  borderColor: error.resolved ? '#E5E7EB' : pc.border,
                  boxShadow: error.resolved ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleResolved(error.id)}
                    className="w-6 h-6 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all cursor-pointer"
                    style={{
                      borderRadius: '6px',
                      border: `2px solid ${error.resolved ? '#26C6A0' : pc.border}`,
                      backgroundColor: error.resolved ? '#26C6A0' : 'white',
                    }}>
                    {error.resolved && <Check size={12} color="white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`font-body text-sm rich-editor-body ${error.resolved ? 'line-through' : ''}`}
                      style={{ color: error.resolved ? '#9CA3AF' : '#1A1A2E' }}
                      dangerouslySetInnerHTML={{ __html: error.text }} />
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="pill" style={{ backgroundColor: cat.bg, color: cat.color }}>{error.category}</span>
                      <span className="text-xs font-body" style={{ color: '#9CA3AF' }}>{error.createdAt}</span>
                    </div>
                  </div>
                  <button onClick={() => deleteError(error.id)} className="btn-icon danger flex-shrink-0"><X size={14} /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

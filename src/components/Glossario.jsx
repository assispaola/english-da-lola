import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { getGlossarioWordsByLevel, addGlossarioWord, updateGlossarioWord, deleteGlossarioWord } from '../utils/glossario'
import { confirmDialog } from '../utils/confirmDialog'
import { useLevel } from '../utils/levels'
import { getCardColorSet } from '../utils/colors'

const CATEGORIES = ['substantivo', 'verbo', 'adjetivo', 'advérbio', 'expressão', 'phrasal verb', 'outro']
const UNITS      = ['1A','1B','2A','2B','3A','3B','4A','4B','5A','5B','6A','6B','7A','7B','8A','8B']

const CAT_COLORS = {
  'substantivo':  { bg: '#FCE4EC', color: '#C2185B' },
  'verbo':        { bg: '#FFF3E0', color: '#FF6B35' },
  'adjetivo':     { bg: '#E0F7FA', color: '#26C6A0' },
  'advérbio':     { bg: '#EDE7F6', color: '#7C3AED' },
  'expressão':    { bg: '#D1FAE5', color: '#059669' },
  'phrasal verb': { bg: '#FEF3C7', color: '#D97706' },
  'outro':        { bg: '#F3F4F6', color: '#6B7280' },
}

const EMPTY = { word: '', pronunciation: '', example: '', category: 'substantivo', unit: '1A' }

export default function Glossario() {
  const { currentLevel } = useLevel()
  const [tick, setTick] = useState(0)
  const refresh = () => setTick(t => t + 1)
  const words = useMemo(() => getGlossarioWordsByLevel(currentLevel), [tick, currentLevel])

  const [showForm,   setShowForm]   = useState(false)
  const [form,       setForm]       = useState(EMPTY)
  const [editId,     setEditId]     = useState(null)
  const [search,     setSearch]     = useState('')
  const [filterUnit, setFilterUnit] = useState('todas')
  const [filterCat,  setFilterCat]  = useState('todas')

  const saveWord = () => {
    if (!form.word.trim()) return
    if (editId) {
      updateGlossarioWord(editId, form)
    } else {
      addGlossarioWord({ ...form, level: currentLevel })
    }
    refresh()
    setForm(EMPTY); setEditId(null); setShowForm(false)
  }

  const startEdit = (word) => {
    setForm({ word: word.word, pronunciation: word.pronunciation, example: word.example, category: word.category, unit: word.unit })
    setEditId(word.id); setShowForm(true)
  }

  const deleteWord = async (id) => {
    if (await confirmDialog('Excluir esta palavra?')) { deleteGlossarioWord(id); refresh() }
  }

  const filtered = words.filter(w => {
    const q = search.toLowerCase()
    const matchSearch = !search
      || w.word.toLowerCase().includes(q)
      || (w.pronunciation || '').toLowerCase().includes(q)
      || (w.example || '').toLowerCase().includes(q)
    return matchSearch && (filterUnit === 'todas' || w.unit === filterUnit) && (filterCat === 'todas' || w.category === filterCat)
  })

  const selClass = "border-2 rounded-lg px-3 py-2 text-sm font-body focus:outline-none bg-white"

  return (
    <div>
      {/* Search + filters */}
      <div className="card-flat p-4 mb-5">
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="buscar palavra, pronúncia ou exemplo…"
            className="input-field pl-9" />
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs font-body mb-1 block" style={{ color: '#9CA3AF' }}>unidade</label>
            <select value={filterUnit} onChange={e => setFilterUnit(e.target.value)}
              className={selClass} style={{ borderColor: '#E5E7EB', color: '#1A1A2E' }}>
              <option value="todas">todas</option>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-body mb-1 block" style={{ color: '#9CA3AF' }}>categoria</label>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className={selClass} style={{ borderColor: '#E5E7EB', color: '#1A1A2E' }}>
              <option value="todas">todas</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={() => { setShowForm(!showForm); setForm(EMPTY); setEditId(null) }} className="btn-primary text-sm">
            <Plus size={14} /> nova palavra
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-5 mb-5">
          <h3 className="font-heading text-lg mb-4 lowercase" style={{ color: '#663399', fontWeight: 500 }}>
            {editId ? 'edit word' : 'new word'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body mb-1" style={{ color: '#9CA3AF' }}>palavra em inglês *</label>
              <input type="text" value={form.word} onChange={e => setForm({ ...form, word: e.target.value })}
                className="input-field" placeholder="ex: beautiful" autoFocus />
            </div>
            <div>
              <label className="block text-xs font-body mb-1" style={{ color: '#9CA3AF' }}>pronúncia aproximada</label>
              <input type="text" value={form.pronunciation} onChange={e => setForm({ ...form, pronunciation: e.target.value })}
                className="input-field" placeholder="ex: biú-ti-ful" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-body mb-1" style={{ color: '#9CA3AF' }}>exemplo de frase</label>
              <input type="text" value={form.example} onChange={e => setForm({ ...form, example: e.target.value })}
                className="input-field" placeholder="ex: She is a beautiful person." />
            </div>
            <div>
              <label className="block text-xs font-body mb-1" style={{ color: '#9CA3AF' }}>categoria</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-body mb-1" style={{ color: '#9CA3AF' }}>unidade do livro</label>
              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="input-field">
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={saveWord} className="btn-primary flex-1 justify-center">salvar</button>
            <button onClick={() => { setShowForm(false); setEditId(null) }} className="btn-secondary flex-1 justify-center">cancelar</button>
          </div>
        </div>
      )}

      <p className="text-sm font-body mb-3" style={{ color: '#9CA3AF' }}>{filtered.length} palavra{filtered.length !== 1 ? 's' : ''}</p>

      {filtered.length === 0 ? (
        <div className="text-center py-14">
          <div className="text-6xl mb-4">📚</div>
          <p className="font-heading text-xl lowercase" style={{ color: '#D1D5DB', fontWeight: 500 }}>
            {words.length === 0 ? `você ainda não tem palavras em ${currentLevel}` : 'no words found 📚'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((word, i) => {
            const cs  = getCardColorSet(i)
            const cat = CAT_COLORS[word.category] || { bg: '#F3F4F6', color: '#6B7280' }
            return (
              <div key={word.id} className="group p-5 transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: cs.accent,
                  border: `2px solid ${cs.border}`,
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
                }}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="pill" style={{ backgroundColor: cat.bg, color: cat.color }}>{word.category}</span>
                    <span className="pill" style={{ backgroundColor: cs.border, color: cs.text }}>{word.unit}</span>
                  </div>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => startEdit(word)} className="btn-icon"><Pencil size={14} /></button>
                    <button onClick={() => deleteWord(word.id)} className="btn-icon danger"><Trash2 size={14} /></button>
                  </div>
                </div>
                <p className="font-heading text-xl" style={{ color: cs.primary, fontWeight: 500 }}>{word.word}</p>
                {word.pronunciation && (
                  <p className="font-body text-sm italic mt-0.5" style={{ color: '#9CA3AF' }}>/{word.pronunciation}/</p>
                )}
                {word.example && (
                  <p className="font-body text-sm mt-2 italic pl-2 border-l-2" style={{ color: cs.text, borderColor: cs.border }}>
                    "{word.example}"
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

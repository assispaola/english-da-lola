import { useState, useMemo } from 'react'
import { Search, Star, Trash2, Pencil } from 'lucide-react'
import { getNotes, updateNote, deleteNote, toggleNoteFavorite } from '../utils/notes'
import { confirmDialog } from '../utils/confirmDialog'
import { findRoadmapTopic } from '../data/roadmapData'
import { DEFAULT_LEVEL } from '../utils/levels'
import { PAGE_COLORS } from '../utils/colors'
import TagChips from './TagChips'
import NoteFields from './NoteFields'

const pc = PAGE_COLORS.anotacoes

const stripHtml = (html) => (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

export default function Anotacoes() {
  const [tick,          setTick]          = useState(0)
  const [search,        setSearch]        = useState('')
  const [tagFilter,     setTagFilter]     = useState('todas')
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [editId,        setEditId]        = useState(null)
  const [editDraft,     setEditDraft]     = useState(null)

  const notes = useMemo(() => getNotes(), [tick])
  const refresh = () => setTick(t => t + 1)

  const allTags = useMemo(() => {
    const set = new Set()
    notes.forEach(n => (n.tags || []).forEach(t => set.add(t)))
    return [...set].sort()
  }, [notes])

  const filtered = notes
    .filter(n => {
      const q = search.trim().toLowerCase()
      const matchesSearch = !q || stripHtml(n.content).toLowerCase().includes(q)
      const matchesTag = tagFilter === 'todas' || (n.tags || []).includes(tagFilter)
      const matchesFav = !onlyFavorites || n.favorite
      return matchesSearch && matchesTag && matchesFav
    })
    .sort((a, b) => (b.favorite === a.favorite ? 0 : b.favorite ? 1 : -1) || new Date(b.timestamp) - new Date(a.timestamp))

  const startEdit = (note) => {
    setEditId(note.id)
    setEditDraft({ content: note.content, tags: note.tags || [], favorite: note.favorite })
  }
  const cancelEdit = () => { setEditId(null); setEditDraft(null) }
  const saveEdit = () => { updateNote(editId, editDraft); cancelEdit(); refresh() }

  const remove = async (id) => { if (await confirmDialog('Excluir esta anotação?')) { deleteNote(id); refresh() } }
  const toggleFav = (id) => { toggleNoteFavorite(id); refresh() }

  return (
    <div className="max-w-3xl">
      {/* Search + filters */}
      <div className="card-flat p-4 mb-5" style={{ borderColor: pc.border }}>
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="buscar nas anotações…" className="input-field pl-9" />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={() => setTagFilter('todas')}
            className="px-3 py-1.5 text-xs font-body font-semibold transition-colors"
            style={{ borderRadius: '8px', backgroundColor: tagFilter === 'todas' ? pc.primary : '#F3F4F6', color: tagFilter === 'todas' ? 'white' : '#6B7280' }}>
            todas
          </button>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setTagFilter(tag)}
              className="px-3 py-1.5 text-xs font-body font-semibold transition-colors"
              style={{ borderRadius: '8px', backgroundColor: tagFilter === tag ? pc.primary : '#F3F4F6', color: tagFilter === tag ? 'white' : '#6B7280' }}>
              {tag}
            </button>
          ))}
          <button onClick={() => setOnlyFavorites(f => !f)}
            className="ml-auto px-3 py-1.5 text-xs font-body font-semibold transition-colors inline-flex items-center gap-1.5"
            style={{ borderRadius: '8px', backgroundColor: onlyFavorites ? '#FEF3C7' : '#F3F4F6', color: onlyFavorites ? '#D97706' : '#6B7280' }}>
            <Star size={12} fill={onlyFavorites ? '#D97706' : 'none'} /> favoritas
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🗒️</div>
          {notes.length === 0 ? (
            <>
              <p className="font-heading text-xl lowercase" style={{ color: '#D1D5DB', fontWeight: 500 }}>você ainda não tem anotações</p>
              <p className="font-body text-sm mt-2" style={{ color: '#9CA3AF' }}>clique no botão + no canto da tela para criar a primeira</p>
            </>
          ) : (
            <>
              <p className="font-heading text-xl lowercase" style={{ color: '#D1D5DB', fontWeight: 500 }}>nenhuma anotação encontrada</p>
              <p className="font-body text-sm mt-2" style={{ color: '#9CA3AF' }}>tente ajustar a busca ou o filtro de tag</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(note => {
            const noteLevel = note.level || DEFAULT_LEVEL
            const topic   = note.topicId ? findRoadmapTopic(note.topicId, noteLevel) : null
            const editing = editId === note.id
            return (
              <div key={note.id} className="card p-4" style={{ borderColor: pc.border }}>
                {editing ? (
                  <>
                    <NoteFields
                      content={editDraft.content} onContentChange={val => setEditDraft(d => ({ ...d, content: val }))}
                      tags={editDraft.tags} onTagsChange={tags => setEditDraft(d => ({ ...d, tags }))}
                      favorite={editDraft.favorite} onToggleFavorite={() => setEditDraft(d => ({ ...d, favorite: !d.favorite }))}
                      pc={pc}
                    />
                    <div className="flex gap-3 mt-3">
                      <button onClick={saveEdit} className="btn-primary flex-1 justify-center text-sm">salvar</button>
                      <button onClick={cancelEdit} className="btn-secondary flex-1 justify-center text-sm">cancelar</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {topic
                          ? <span className="pill" style={{ backgroundColor: pc.accent, color: pc.primary }}>{topic.title}</span>
                          : <span className="pill" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>avulsa</span>}
                        <span className="pill" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>{noteLevel}</span>
                        <span className="text-xs font-body" style={{ color: '#9CA3AF' }}>
                          {new Date(note.timestamp).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => toggleFav(note.id)} className="btn-icon" title="favoritar">
                          <Star size={15} fill={note.favorite ? '#FBBF24' : 'none'} color={note.favorite ? '#FBBF24' : '#9CA3AF'} />
                        </button>
                        <button onClick={() => startEdit(note)} className="btn-icon"><Pencil size={14} /></button>
                        <button onClick={() => remove(note.id)} className="btn-icon danger"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div className="font-body text-sm rich-editor-body" style={{ color: '#1A1A2E' }}
                      dangerouslySetInnerHTML={{ __html: note.content }} />
                    {note.tags?.length > 0 && <div className="mt-2"><TagChips tags={note.tags} /></div>}
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

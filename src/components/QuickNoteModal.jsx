import { useState } from 'react'
import { X } from 'lucide-react'
import { addNote } from '../utils/notes'
import { useLevel } from '../utils/levels'
import { COLOR_SETS } from '../utils/colors'
import NoteFields from './NoteFields'

const pc = COLOR_SETS.b1

export default function QuickNoteModal({ onClose }) {
  const { currentLevel } = useLevel()
  const [content,  setContent]  = useState('')
  const [tags,     setTags]     = useState([])
  const [favorite, setFavorite] = useState(false)

  const isEmpty = !content.replace(/<[^>]+>/g, '').trim()

  const save = () => {
    if (isEmpty) return
    addNote({ topicId: null, content, tags, favorite, level: currentLevel })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(26,26,46,0.45)' }}
      onClick={onClose}>
      <div className="card p-6 w-full max-w-lg" style={{ borderColor: pc.border }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl lowercase" style={{ color: pc.primary, fontWeight: 500 }}>anotação rápida</h2>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>

        <NoteFields
          content={content} onContentChange={setContent}
          tags={tags} onTagsChange={setTags}
          favorite={favorite} onToggleFavorite={() => setFavorite(f => !f)}
          pc={pc}
          placeholder="anote algo rapidamente… não precisa estar vinculado a um tópico"
          rows={4}
        />

        <div className="flex gap-3 mt-4">
          <button onClick={save} disabled={isEmpty} className="btn-primary flex-1 justify-center">salvar</button>
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">cancelar</button>
        </div>
      </div>
    </div>
  )
}

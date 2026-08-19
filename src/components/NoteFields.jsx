import { Star } from 'lucide-react'
import RichTextEditor from './RichTextEditor'
import TagInput from './TagInput'

// Shared note editing block (rich text + tags + favorite star) used by the
// per-topic panel in Roadmap, the quick-note modal, and the "anotações" page.
export default function NoteFields({
  content, onContentChange,
  tags, onTagsChange,
  favorite, onToggleFavorite,
  pc, placeholder = 'suas anotações…', rows = 3,
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-body" style={{ color: '#9CA3AF' }}>anotação</span>
        <button type="button" onClick={onToggleFavorite} className="btn-icon"
          title={favorite ? 'remover dos favoritos' : 'marcar como favorita'}>
          <Star size={16} fill={favorite ? '#FBBF24' : 'none'} color={favorite ? '#FBBF24' : '#9CA3AF'} />
        </button>
      </div>
      <RichTextEditor
        value={content}
        onChange={onContentChange}
        placeholder={placeholder}
        rows={rows}
        accentColor={pc?.accent}
        borderColor={pc?.border}
        primaryColor={pc?.primary}
      />
      <div className="mt-2">
        <TagInput tags={tags} onChange={onTagsChange} borderColor={pc?.border} />
      </div>
    </div>
  )
}

import { useState } from 'react'
import { X } from 'lucide-react'
import { getTagColor } from '../utils/colors'

function normalizeTag(raw) {
  const t = raw.trim().replace(/^#/, '').toLowerCase().replace(/\s+/g, '-')
  return t ? `#${t}` : ''
}

// Editable free-text tag chips: type + Enter/comma to add, click × or
// Backspace-on-empty to remove. Tags are normalized to "#kebab-case".
export default function TagInput({ tags = [], onChange, borderColor = '#F8BBD0' }) {
  const [draft, setDraft] = useState('')

  const addTag = () => {
    const tag = normalizeTag(draft)
    if (tag && !tags.includes(tag)) onChange([...tags, tag])
    setDraft('')
  }
  const removeTag = (tag) => onChange(tags.filter(t => t !== tag))

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2"
      style={{ border: `1.5px solid ${borderColor}`, borderRadius: '10px', backgroundColor: 'white' }}>
      {tags.map(tag => {
        const c = getTagColor(tag)
        return (
          <span key={tag} className="pill inline-flex items-center gap-1" style={{ backgroundColor: c.bg, color: c.color }}>
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="inline-flex" style={{ color: c.color }}>
              <X size={10} />
            </button>
          </span>
        )
      })}
      <input
        type="text"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() }
          else if (e.key === 'Backspace' && !draft && tags.length) removeTag(tags[tags.length - 1])
        }}
        onBlur={addTag}
        placeholder="adicionar tag…"
        className="text-xs font-body flex-1 min-w-[110px] focus:outline-none"
        style={{ border: 'none', backgroundColor: 'transparent', color: '#6B7280', padding: '3px 4px' }}
      />
    </div>
  )
}

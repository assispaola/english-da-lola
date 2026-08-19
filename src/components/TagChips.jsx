import { getTagColor } from '../utils/colors'

// Read-only display of tag chips (search/filter lists, note previews).
export default function TagChips({ tags = [] }) {
  if (!tags.length) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map(tag => {
        const c = getTagColor(tag)
        return <span key={tag} className="pill" style={{ backgroundColor: c.bg, color: c.color }}>{tag}</span>
      })}
    </div>
  )
}

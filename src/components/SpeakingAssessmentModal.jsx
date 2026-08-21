import { useState } from 'react'
import { X } from 'lucide-react'
import { PAGE_COLORS } from '../utils/colors'
import { RATING_META } from '../utils/speakingAssessments'

export default function SpeakingAssessmentModal({ topicTitle, onCancel, onSubmit }) {
  const pc = PAGE_COLORS.roadmap
  const [rating, setRating] = useState(null)
  const [note,   setNote]   = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onCancel}>
      <div className="card-flat p-6 w-full max-w-sm" style={{ borderColor: pc.border }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-heading text-lg lowercase" style={{ color: pc.primary, fontWeight: 800 }}>autoavaliação de fala</h2>
          <button onClick={onCancel} className="btn-icon"><X size={18} /></button>
        </div>
        <p className="font-body text-xs mb-4" style={{ color: '#9CA3AF' }}>{topicTitle}</p>

        <p className="font-body text-sm mb-3" style={{ color: '#1A1A2E' }}>Como foi praticar isso em voz alta?</p>
        <div className="flex gap-2 mb-4">
          {RATING_META.map(r => (
            <button key={r.id} onClick={() => setRating(r.id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-all"
              style={{
                borderRadius: '10px',
                border: `1.5px solid ${rating === r.id ? pc.primary : '#E5E7EB'}`,
                backgroundColor: rating === r.id ? pc.accent : 'white',
              }}>
              <span style={{ fontSize: '22px' }}>{r.emoji}</span>
              <span className="font-body text-xs text-center leading-tight" style={{ color: rating === r.id ? pc.primary : '#6B7280' }}>{r.label}</span>
            </button>
          ))}
        </div>

        <label className="block font-body text-xs mb-1" style={{ color: '#9CA3AF' }}>nota (opcional)</label>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
          placeholder="ex: travei na pronúncia de 'Wednesday'…" className="input-field mb-4" />

        <div className="flex gap-2">
          <button onClick={onCancel} className="btn-secondary flex-1">cancelar</button>
          <button onClick={() => rating && onSubmit({ rating, note })} disabled={!rating} className="btn-primary flex-1">
            registrar e concluir
          </button>
        </div>
      </div>
    </div>
  )
}

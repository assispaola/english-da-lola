/** Inline auto-save status indicator — renders nothing when status is null */
export default function SaveStatus({ status }) {
  if (!status) return null
  return (
    <span className="text-xs font-body" style={{
      color: status === 'saved' ? '#059669' : '#9CA3AF',
      transition: 'color 0.3s',
    }}>
      {status === 'saving' ? 'Salvando…' : '✓ Salvo'}
    </span>
  )
}

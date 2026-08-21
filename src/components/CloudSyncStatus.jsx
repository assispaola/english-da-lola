import { useEffect, useState } from 'react'
import { RefreshCw, CloudOff } from 'lucide-react'
import { onSyncStatusChange, getSyncStatus, retrySyncNow } from '../utils/syncEngine'

// Discreet global indicator for background cloud sync — only visible while
// actively saving or when a write is stuck offline (with a manual retry).
// Renders nothing the rest of the time.
export default function CloudSyncStatus() {
  const [status, setStatus] = useState(getSyncStatus())

  useEffect(() => onSyncStatusChange(setStatus), [])

  if (status === 'idle' || status === 'saved') return null

  const isError = status === 'error'

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 z-40 flex items-center gap-1.5 px-3 py-1.5 font-body text-xs shadow-md"
      style={{
        borderRadius: '999px',
        backgroundColor: isError ? '#FEF2F2' : 'white',
        border: `1.5px solid ${isError ? '#FCA5A5' : '#E5E7EB'}`,
        color: isError ? '#DC2626' : '#6B7280',
      }}>
      {isError ? <CloudOff size={13} /> : <RefreshCw size={13} className="animate-spin" />}
      <span>{isError ? 'erro ao salvar na nuvem' : 'salvando…'}</span>
      {isError && (
        <button onClick={() => retrySyncNow()} className="underline ml-1" style={{ color: '#DC2626' }}>
          tentar de novo
        </button>
      )}
    </div>
  )
}

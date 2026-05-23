import { useState, useCallback, useRef } from 'react'

/**
 * useAutoSave — wraps a save function and manages "Salvando..." → "✓ Salvo" status.
 */
export function useAutoSave(saveFn, delay = 400) {
  const [status, setStatus] = useState(null) // null | 'saving' | 'saved'
  const timerRef = useRef(null)

  const save = useCallback((...args) => {
    clearTimeout(timerRef.current)
    setStatus('saving')
    try { saveFn(...args) } catch {}
    timerRef.current = setTimeout(() => {
      setStatus('saved')
      timerRef.current = setTimeout(() => setStatus(null), 2000)
    }, delay)
  }, [saveFn, delay])

  return { save, status }
}

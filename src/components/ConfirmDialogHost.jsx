import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { onConfirmRequest } from '../utils/confirmDialog'

const VARIANTS = {
  danger:  { Icon: AlertTriangle, iconBg: '#FEE2E2', iconColor: '#DC2626' },
  success: { Icon: CheckCircle2,  iconBg: '#D1FAE5', iconColor: '#059669' },
  info:    { Icon: Info,          iconBg: '#DBEAFE', iconColor: '#2563EB' },
}

// One instance mounted app-wide (App.jsx). Renders whatever confirmDialog()/
// alertDialog() last requested, styled consistently with the rest of the
// app instead of the browser's native confirm()/alert() dialog.
export default function ConfirmDialogHost() {
  const [request, setRequest] = useState(null)

  useEffect(() => onConfirmRequest(setRequest), [])

  if (!request) return null

  const { message, resolve, opts = {} } = request
  const variant = VARIANTS[opts.variant] || VARIANTS.danger
  const { Icon } = variant

  const close = (result) => { resolve(result); setRequest(null) }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={() => close(false)}>
      <div className="card-flat p-6 w-full max-w-sm text-center" style={{ borderColor: '#F8BBD0' }} onClick={e => e.stopPropagation()}>
        <div className="mx-auto mb-3 flex items-center justify-center flex-shrink-0"
          style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: variant.iconBg }}>
          <Icon size={20} color={variant.iconColor} />
        </div>
        <p className="font-body text-sm mb-5" style={{ color: '#1A1A2E', whiteSpace: 'pre-line' }}>{message}</p>

        {opts.alertOnly ? (
          <button onClick={() => close(true)} className="btn-primary w-full">{opts.okLabel || 'ok'}</button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => close(false)} className="btn-secondary flex-1">{opts.cancelLabel || 'cancelar'}</button>
            <button onClick={() => close(true)} className="btn-primary flex-1" style={{ backgroundColor: '#DC2626' }}>
              {opts.confirmLabel || 'excluir'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

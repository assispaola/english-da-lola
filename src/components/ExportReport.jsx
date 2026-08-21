import { useState } from 'react'
import { Download } from 'lucide-react'
import ExportModal from './ExportModal'

export default function ExportReport() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary gap-2">
        <Download size={16} />
        exportar progresso
      </button>
      {open && <ExportModal onClose={() => setOpen(false)} />}
    </>
  )
}

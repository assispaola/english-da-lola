import { useState, useMemo, useEffect } from 'react'
import { X, FileText, Printer, CheckSquare, Square } from 'lucide-react'
import { useLevel } from '../utils/levels'
import { getDiarioEntries } from '../utils/diario'
import { getNotes } from '../utils/notes'
import { getErrorLogs } from '../utils/errorLog'
import { getFlashcardsByLevel } from '../utils/flashcards'
import {
  downloadTxt, openPrintable, printShell,
  diarioEntryHtml, diarioEntryTxt,
  noteEntryHtml, noteEntryTxt, noteTitle,
  errosHtml, errosTxt,
  flashcardsHtml, flashcardsTxt,
  progressoGeralHtml, progressoGeralTxt,
} from '../utils/exportFormats'

const RESOURCES = [
  { id: 'diario',     label: 'diário de bordo',          hasEntries: true  },
  { id: 'anotacoes',  label: 'anotações',                hasEntries: true  },
  { id: 'erros',      label: 'banco de erros',           hasEntries: false },
  { id: 'flashcards', label: 'flashcards',                hasEntries: false },
  { id: 'roadmap',    label: 'progresso geral (roadmap)', hasEntries: false },
  { id: 'tudo',       label: 'tudo',                       hasEntries: false },
]

export default function ExportModal({ onClose }) {
  const { currentLevel } = useLevel()
  const [resource, setResource] = useState('diario')
  const [selectedIds, setSelectedIds] = useState(new Set())

  const diarioEntries = useMemo(() => getDiarioEntries().sort((a, b) => (b.date || '').localeCompare(a.date || '')), [])
  const noteEntries   = useMemo(() => getNotes().sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || '')), [])

  const entries = resource === 'diario' ? diarioEntries : resource === 'anotacoes' ? noteEntries : []
  const showEntryList = resource === 'diario' || resource === 'anotacoes'

  // Whenever the resource (or its entry list) changes, default to "all selected".
  useEffect(() => {
    if (showEntryList) setSelectedIds(new Set(entries.map(e => e.id)))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource])

  const toggle = (id) => setSelectedIds(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })

  const buildDoc = () => {
    const today = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

    if (resource === 'diario') {
      const chosen = diarioEntries.filter(e => selectedIds.has(e.id))
      const title = chosen.length === 1 ? `diário de bordo — ${chosen[0].date}` : `diário de bordo (${chosen.length} entradas)`
      return {
        title,
        bodyHtml: chosen.map(diarioEntryHtml).join('') || '<p>Nenhuma entrada selecionada</p>',
        txt: chosen.map(diarioEntryTxt).join('\n\n---\n\n') || 'Nenhuma entrada selecionada',
      }
    }
    if (resource === 'anotacoes') {
      const chosen = noteEntries.filter(e => selectedIds.has(e.id))
      const title = chosen.length === 1 ? `anotação — ${noteTitle(chosen[0])}` : `anotações (${chosen.length})`
      return {
        title,
        bodyHtml: chosen.map(noteEntryHtml).join('') || '<p>Nenhuma anotação selecionada</p>',
        txt: chosen.map(noteEntryTxt).join('\n\n---\n\n') || 'Nenhuma anotação selecionada',
      }
    }
    if (resource === 'erros') {
      const all = getErrorLogs()
      return { title: 'banco de erros', bodyHtml: errosHtml(all), txt: errosTxt(all) }
    }
    if (resource === 'flashcards') {
      const cards = getFlashcardsByLevel(currentLevel)
      return { title: `flashcards — nível ${currentLevel}`, bodyHtml: flashcardsHtml(cards), txt: flashcardsTxt(cards) }
    }
    if (resource === 'roadmap') {
      return { title: `progresso geral — nível ${currentLevel} — ${today}`, bodyHtml: progressoGeralHtml(currentLevel), txt: progressoGeralTxt(currentLevel) }
    }
    // 'tudo'
    const errs  = getErrorLogs()
    const cards = getFlashcardsByLevel(currentLevel)
    return {
      title: `progresso completo — ${today}`,
      bodyHtml: [
        progressoGeralHtml(currentLevel),
        errosHtml(errs),
        flashcardsHtml(cards),
        '<h2>📓 diário de bordo</h2>', diarioEntries.map(diarioEntryHtml).join('') || '<p>Nenhuma entrada</p>',
        '<h2>🗒️ anotações</h2>', noteEntries.map(noteEntryHtml).join('') || '<p>Nenhuma anotação</p>',
      ].join(''),
      txt: [
        progressoGeralTxt(currentLevel),
        '', '— BANCO DE ERROS —', errosTxt(errs),
        '', '— FLASHCARDS —', flashcardsTxt(cards),
        '', '— DIÁRIO DE BORDO —', diarioEntries.map(diarioEntryTxt).join('\n\n---\n\n') || 'Nenhuma entrada',
        '', '— ANOTAÇÕES —', noteEntries.map(noteEntryTxt).join('\n\n---\n\n') || 'Nenhuma anotação',
      ].join('\n'),
    }
  }

  const handleExport = (format) => {
    const { title, bodyHtml, txt } = buildDoc()
    if (format === 'txt') downloadTxt(`${title}.txt`, txt)
    else openPrintable(printShell(title, bodyHtml))
  }

  const nothingSelected = showEntryList && selectedIds.size === 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="card-flat p-6 w-full max-w-lg max-h-[85vh] flex flex-col" style={{ borderColor: '#F8BBD0' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 className="font-heading text-xl lowercase" style={{ color: '#E91E8C', fontWeight: 800 }}>exportar progresso</h2>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1 -mx-1 px-1">
          {/* Resource picker */}
          <p className="font-body text-xs uppercase tracking-wide mb-2" style={{ color: '#9CA3AF' }}>o que exportar</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {RESOURCES.map(r => (
              <button key={r.id} onClick={() => setResource(r.id)}
                className="pill font-body"
                style={{
                  cursor: 'pointer', border: `1.5px solid ${resource === r.id ? '#E91E8C' : '#E5E7EB'}`,
                  backgroundColor: resource === r.id ? '#FCE4EC' : 'white',
                  color: resource === r.id ? '#C2185B' : '#6B7280',
                }}>
                {r.label}
              </button>
            ))}
          </div>

          {/* Entry picker for diário/anotações */}
          {showEntryList && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-2">
                <p className="font-body text-xs uppercase tracking-wide" style={{ color: '#9CA3AF' }}>
                  selecione as entradas ({selectedIds.size}/{entries.length})
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedIds(new Set(entries.map(e => e.id)))} className="font-body text-xs underline" style={{ color: '#E91E8C' }}>todas</button>
                  <button onClick={() => setSelectedIds(new Set())} className="font-body text-xs underline" style={{ color: '#9CA3AF' }}>nenhuma</button>
                </div>
              </div>

              {entries.length === 0 ? (
                <p className="font-body text-sm text-center py-6" style={{ color: '#9CA3AF' }}>nada por aqui ainda</p>
              ) : (
                <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1">
                  {entries.map(entry => {
                    const checked = selectedIds.has(entry.id)
                    const label = resource === 'diario'
                      ? new Date(`${entry.date}T00:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
                      : noteTitle(entry)
                    const sub = resource === 'diario'
                      ? (entry.content?.replace(/<[^>]+>/g, ' ').trim().slice(0, 60) || 'sem conteúdo')
                      : (entry.timestamp ? new Date(entry.timestamp).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }) : '')
                    return (
                      <button key={entry.id} onClick={() => toggle(entry.id)}
                        className="flex items-start gap-2 text-left px-2.5 py-2 transition-colors"
                        style={{ borderRadius: '8px', backgroundColor: checked ? '#FFF0F6' : 'transparent' }}>
                        {checked ? <CheckSquare size={16} color="#E91E8C" style={{ flexShrink: 0, marginTop: '1px' }} /> : <Square size={16} color="#D1D5DB" style={{ flexShrink: 0, marginTop: '1px' }} />}
                        <span className="min-w-0">
                          <span className="block font-body text-sm font-semibold truncate" style={{ color: '#1A1A2E' }}>{label}</span>
                          {sub && <span className="block font-body text-xs truncate" style={{ color: '#9CA3AF' }}>{sub}</span>}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Format buttons */}
        <div className="flex gap-2 mt-5 pt-4 flex-shrink-0" style={{ borderTop: '1.5px solid #F3F4F6' }}>
          <button onClick={() => handleExport('txt')} disabled={nothingSelected} className="btn-secondary flex-1 gap-2">
            <FileText size={16} /> baixar .txt
          </button>
          <button onClick={() => handleExport('pdf')} disabled={nothingSelected} className="btn-primary flex-1 gap-2">
            <Printer size={16} /> abrir para pdf
          </button>
        </div>
      </div>
    </div>
  )
}

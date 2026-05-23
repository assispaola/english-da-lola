import { useState, useEffect } from 'react'
import { X, Menu } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Flashcards from './components/Flashcards'
import Roadmap from './components/Roadmap'
import DiarioBordo from './components/DiarioBordo'
import BancoDeErros from './components/BancoDeErros'
import Glossario from './components/Glossario'
import PrepVIP from './components/PrepVIP'
import FraseDoDia from './components/FraseDoDia'
import MetasSemanais from './components/MetasSemanais'
import WavyBackground from './components/WavyBackground'
import { PAGE_COLORS } from './utils/colors'
import { initBackupSchedule } from './utils/backup'
import { LayoutDashboard, Layers, Map, BookMarked, Target } from 'lucide-react'

const PAGE_TITLES = {
  dashboard:  'dashboard',
  flashcards: 'flashcards',
  roadmap:    'roadmap',
  diario:     'journal',
  erros:      'error bank',
  glossario:  'personal glossary',
  vip:        'vip prep',
  frase:      'daily phrase',
  metas:      'weekly goals',
}

const PAGE_SUBTITLES = {
  dashboard:  'visão geral do seu progresso',
  flashcards: 'revise seus cartões de estudo',
  roadmap:    'acompanhe sua jornada a1',
  diario:     'escreva livremente em inglês',
  erros:      'monitore e resolva erros recorrentes',
  glossario:  'seu dicionário pessoal',
  vip:        'prepare-se para suas aulas',
  frase:      'aprenda uma frase por dia',
  metas:      'objetivos da semana atual',
}

const BOTTOM_NAV = [
  { id: 'dashboard',  label: 'início',   Icon: LayoutDashboard },
  { id: 'flashcards', label: 'cards',    Icon: Layers },
  { id: 'roadmap',    label: 'mapa',     Icon: Map },
  { id: 'glossario',  label: 'vocab',    Icon: BookMarked },
  { id: 'metas',      label: 'metas',    Icon: Target },
]

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 8000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed top-4 right-4 z-50 bg-white p-4 shadow-xl max-w-sm"
      style={{ border: '1.5px solid #FBBF24', borderRadius: '12px', animation: 'slideIn 0.3s ease' }}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">⚠️</span>
        <div className="flex-1">
          <p className="font-heading text-amber-700 text-base">lembrete: erro recorrente</p>
          <p className="text-amber-600 text-sm mt-1 font-body">{message}</p>
        </div>
        <button onClick={onClose} className="btn-icon ml-1"><X size={16} /></button>
      </div>
    </div>
  )
}

export default function App() {
  const [activePage,  setActivePage]  = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast,       setToast]       = useState(null)

  // Initialise backup schedule on mount
  useEffect(() => {
    const cleanup = initBackupSchedule()
    return cleanup
  }, [])

  // Show random pending error toast on load
  useEffect(() => {
    try {
      const errors  = JSON.parse(localStorage.getItem('ej_erros') || '[]')
      const pending = errors.filter(e => !e.resolved)
      if (pending.length > 0) {
        const random = pending[Math.floor(Math.random() * pending.length)]
        setToast(random.text)
      }
    } catch {}
  }, [])

  const navigate = (page) => { setActivePage(page); setSidebarOpen(false) }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':  return <Dashboard setActivePage={navigate} />
      case 'flashcards': return <Flashcards />
      case 'roadmap':    return <Roadmap />
      case 'diario':     return <DiarioBordo />
      case 'erros':      return <BancoDeErros />
      case 'glossario':  return <Glossario />
      case 'vip':        return <PrepVIP />
      case 'frase':      return <FraseDoDia />
      case 'metas':      return <MetasSemanais />
      default:           return <Dashboard setActivePage={navigate} />
    }
  }

  const pc = PAGE_COLORS[activePage] || PAGE_COLORS.dashboard

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F8F9FA' }}>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative z-40 md:z-auto h-full
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar activePage={activePage} setActivePage={navigate} />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Curved page header */}
        <header className="page-header-curved flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${pc.primary} 0%, ${pc.secondary} 100%)` }}>

          {/* Mobile hamburger */}
          <button
            className="md:hidden absolute top-4 left-4 p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            onClick={() => setSidebarOpen(true)}>
            <Menu size={20} color="white" />
          </button>

          <div className="md:ml-0 ml-10">
            <h1>{PAGE_TITLES[activePage]}</h1>
            <p>{PAGE_SUBTITLES[activePage]}</p>
          </div>

          <WavyBackground
            color1="rgba(255,255,255,0.10)"
            color2="rgba(255,255,255,0.06)"
          />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 main-content">
          {renderPage()}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden flex justify-around items-center h-16 z-30 no-print"
        style={{ borderColor: '#E5E7EB' }}>
        {BOTTOM_NAV.map(({ id, label, Icon }) => {
          const active = activePage === id
          const c = PAGE_COLORS[id] || PAGE_COLORS.dashboard
          return (
            <button key={id} onClick={() => navigate(id)}
              className="flex flex-col items-center justify-center gap-0.5 py-2 px-3 transition-colors flex-1"
              style={{ color: active ? c.primary : '#9CA3AF' }}>
              <Icon size={22} />
              <span className="text-xs font-body">{label}</span>
            </button>
          )
        })}
      </nav>

      <style>{`
        @keyframes slideIn {
          from { opacity:0; transform:translateX(20px); }
          to   { opacity:1; transform:translateX(0); }
        }
      `}</style>
    </div>
  )
}

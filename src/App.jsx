import { useState, useEffect } from 'react'
import { LayoutDashboard, Layers, Map, BookMarked, Target, Menu, X } from 'lucide-react'
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
    <div className="fixed top-4 right-4 z-50 bg-white rounded-2xl p-4 shadow-xl max-w-sm"
      style={{ border: '1.5px solid #FBBF24', animation: 'slideIn 0.3s ease' }}>
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
  const [activePage,   setActivePage]   = useState('dashboard')
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [toast,        setToast]        = useState(null)

  useEffect(() => {
    try {
      const errors   = JSON.parse(localStorage.getItem('ej_erros') || '[]')
      const pending  = errors.filter(e => !e.resolved)
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

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#FFF0F6' }}>
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
        {/* Top header */}
        <header className="flex-shrink-0 text-white px-4 md:px-6 py-4 shadow-md flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #E91E8C 0%, #C2185B 100%)' }}>
          {/* Mobile hamburger */}
          <button className="md:hidden p-1.5 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors flex-shrink-0"
            onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <h1 className="font-heading text-xl md:text-2xl leading-tight lowercase truncate"
                style={{ fontWeight: 700, color: 'white' }}>
                {PAGE_TITLES[activePage]}
              </h1>
              <p className="text-pink-100 text-xs font-body hidden md:block">english journey — a1 🌸</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 main-content">
          {renderPage()}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden flex justify-around items-center h-16 z-30 no-print"
        style={{ borderColor: '#F8BBD0' }}>
        {BOTTOM_NAV.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => navigate(id)}
            className="flex flex-col items-center justify-center gap-0.5 py-2 px-3 transition-colors flex-1"
            style={{ color: activePage === id ? '#E91E8C' : '#9CA3AF' }}>
            <Icon size={22} />
            <span className="text-xs font-body">{label}</span>
          </button>
        ))}
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

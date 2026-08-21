import { useState, useEffect } from 'react'
import { X, Menu, Plus, PartyPopper } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Flashcards from './components/Flashcards'
import Praticar from './components/Praticar'
import Roadmap from './components/Roadmap'
import DiarioBordo from './components/DiarioBordo'
import Anotacoes from './components/Anotacoes'
import BancoDeErros from './components/BancoDeErros'
import Conquistas from './components/Conquistas'
import Glossario from './components/Glossario'
import PrepVIP from './components/PrepVIP'
import FraseDoDia from './components/FraseDoDia'
import MetasSemanais from './components/MetasSemanais'
import WavyBackground from './components/WavyBackground'
import QuickNoteModal from './components/QuickNoteModal'
import Login from './components/Login'
import CloudSyncStatus from './components/CloudSyncStatus'
import { PAGE_COLORS } from './utils/colors'
import { initBackupSchedule } from './utils/backup'
import { useLevel, LevelProvider } from './utils/levels'
import { isFirebaseConfigured } from './firebase'
import { onAuthChange, signOutUser } from './utils/auth'
import { isEmailAllowed } from './utils/allowlist'
import { setSyncUser, migrateLocalToCloudIfNeeded, pullAllFromCloud, flushRetryQueue } from './utils/syncEngine'
import { LayoutDashboard, Layers, Map, BookMarked, Target } from 'lucide-react'

const PAGE_TITLES = {
  dashboard:  'dashboard',
  flashcards: 'flashcards',
  praticar:   'praticar',
  roadmap:    'roadmap',
  diario:     'journal',
  anotacoes:  'anotações',
  erros:      'error bank',
  glossario:  'personal glossary',
  conquistas: 'conquistas',
  vip:        'vip prep',
  frase:      'daily phrase',
  metas:      'weekly goals',
}

const PAGE_SUBTITLES = {
  dashboard:  'visão geral do seu progresso',
  flashcards: 'revise seus cartões de estudo',
  praticar:   'exercícios por tópico e revisão rápida',
  roadmap:    'acompanhe sua jornada',
  diario:     'escreva livremente em inglês',
  anotacoes:  'busque e organize suas anotações por tag',
  erros:      'monitore e resolva erros recorrentes',
  glossario:  'seu dicionário pessoal',
  conquistas: 'streak, xp e badges',
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

function LevelUnlockToast({ level, onClose, offset }) {
  useEffect(() => {
    const t = setTimeout(onClose, 8000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`fixed ${offset ? 'top-28' : 'top-4'} right-4 z-50 bg-white p-4 shadow-xl max-w-sm`}
      style={{ border: '1.5px solid #F9A8D4', borderRadius: '12px', animation: 'slideIn 0.3s ease' }}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0"><PartyPopper size={22} color="#E91E8C" /></span>
        <div className="flex-1">
          <p className="font-heading text-base lowercase" style={{ color: '#C2185B' }}>nível {level} desbloqueado!</p>
          <p className="text-sm mt-1 font-body" style={{ color: '#9D174D' }}>você concluiu o roadmap anterior — hora de avançar 🎉</p>
        </div>
        <button onClick={onClose} className="btn-icon ml-1"><X size={16} /></button>
      </div>
    </div>
  )
}

function AppShell() {
  const { currentLevel, justUnlocked, clearJustUnlocked } = useLevel()
  const [activePage,    setActivePage]    = useState('dashboard')
  const [sidebarOpen,   setSidebarOpen]   = useState(false)
  const [toast,         setToast]         = useState(null)
  const [quickNoteOpen, setQuickNoteOpen] = useState(false)

  // Initialise backup schedule on mount
  useEffect(() => {
    const cleanup = initBackupSchedule()
    return cleanup
  }, [])

  // Show random pending (non-archived) error toast on load
  useEffect(() => {
    try {
      const errors  = JSON.parse(localStorage.getItem('ej_error_log') || '[]')
      const pending = errors.filter(e => !e.archived)
      if (pending.length > 0) {
        const random = pending[Math.floor(Math.random() * pending.length)]
        setToast(random.description)
      }
    } catch {}
  }, [])

  const navigate = (page) => { setActivePage(page); setSidebarOpen(false) }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':  return <Dashboard setActivePage={navigate} />
      case 'flashcards': return <Flashcards />
      case 'praticar':   return <Praticar />
      case 'roadmap':    return <Roadmap />
      case 'diario':     return <DiarioBordo />
      case 'anotacoes':  return <Anotacoes />
      case 'erros':      return <BancoDeErros />
      case 'glossario':  return <Glossario />
      case 'conquistas': return <Conquistas />
      case 'vip':        return <PrepVIP />
      case 'frase':      return <FraseDoDia />
      case 'metas':      return <MetasSemanais />
      default:           return <Dashboard setActivePage={navigate} />
    }
  }

  const pc = PAGE_COLORS[activePage] || PAGE_COLORS.dashboard

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F8F9FA' }}>
      {isFirebaseConfigured && <CloudSyncStatus />}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {justUnlocked && <LevelUnlockToast level={justUnlocked} offset={!!toast} onClose={clearJustUnlocked} />}
      {quickNoteOpen && <QuickNoteModal onClose={() => setQuickNoteOpen(false)} />}

      {/* Global floating "quick note" button — smaller on mobile so it doesn't
          obscure short pages' content (e.g. empty-state text) as much */}
      <button onClick={() => setQuickNoteOpen(true)}
        className="fixed z-40 flex items-center justify-center transition-all hover:scale-105 bottom-20 md:bottom-6 right-4 md:right-6 w-12 h-12 md:w-14 md:h-14"
        style={{
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #E91E8C, #C2185B)',
          boxShadow: '0 4px 16px rgba(233,30,140,0.4)', border: 'none', cursor: 'pointer',
        }}
        title="anotação rápida">
        <Plus size={24} color="white" />
      </button>

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
            <p>{activePage === 'roadmap' ? `acompanhe sua jornada ${currentLevel.toLowerCase()}` : PAGE_SUBTITLES[activePage]}</p>
          </div>

          <WavyBackground
            color1="rgba(255,255,255,0.10)"
            color2="rgba(255,255,255,0.06)"
          />
        </header>

        {/* Page content — keyed by level so switching levels remounts the
            current page cleanly (its per-level localStorage keys/effects
            need a fresh mount, not a stale one from the previous level) */}
        <main key={currentLevel} className="flex-1 overflow-y-auto p-4 md:p-6 main-content">
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

function SplashScreen({ message }) {
  return (
    <div className="flex h-screen items-center justify-center flex-col gap-3" style={{ backgroundColor: '#F8F9FA' }}>
      <p className="font-heading text-2xl lowercase" style={{ fontWeight: 900, color: '#E91E8C' }}>english journey ♥</p>
      {message && <p className="font-body text-sm" style={{ color: '#9CA3AF' }}>{message}</p>}
    </div>
  )
}

// Auth gate: shows a splash while checking auth state, the login screen when
// signed out, and — while signed in — migrates any pre-existing localStorage
// data to Firestore on the very first login, or pulls the latest cloud data
// down before the app renders (so every component's first read already sees
// synced data, no reload needed). Firebase being unconfigured (no .env yet)
// just falls back to local-only mode, no login required.
export default function App() {
  const [authState, setAuthState] = useState(isFirebaseConfigured ? 'loading' : 'local')
  const [loginNotice, setLoginNotice] = useState('')

  useEffect(() => {
    if (!isFirebaseConfigured) return
    const unsubscribe = onAuthChange(async (user) => {
      if (!user) {
        setSyncUser(null)
        setAuthState('out')
        return
      }
      // Re-checked on every auth state change, not just at sign-up — so a
      // persisted session from before an email was removed from the
      // allowlist (or a pre-existing account that was never on it) gets
      // kicked out on the next load too, not only on the next login attempt.
      const allowed = await isEmailAllowed(user.email)
      if (!allowed) {
        await signOutUser()
        setSyncUser(null)
        setLoginNotice('este app é de uso restrito — acesso não autorizado para este email.')
        setAuthState('out')
        return
      }
      setSyncUser(user.uid)
      setAuthState('syncing')
      try {
        const migrated = await migrateLocalToCloudIfNeeded()
        if (!migrated) await pullAllFromCloud()
        await flushRetryQueue()
      } catch (err) {
        console.error('Cloud sync failed, continuing with local data:', err)
      }
      setAuthState('in')
    })
    return unsubscribe
  }, [])

  if (authState === 'loading') return <SplashScreen />
  if (authState === 'out') return <Login initialNotice={loginNotice} />
  if (authState === 'syncing') return <SplashScreen message="sincronizando seus dados…" />

  // LevelProvider mounts here (not globally in main.jsx) so its initial read
  // of ej_current_level/ej_levels_unlocked/ej_roadmap__* happens AFTER any
  // cloud pull above has already written the synced values to localStorage.
  return (
    <LevelProvider>
      <AppShell />
    </LevelProvider>
  )
}

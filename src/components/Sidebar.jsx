import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Layers, Map, BookOpen,
  AlertCircle, BookMarked, Star, MessageSquare, Target, Dumbbell, NotebookPen, Award, LogOut,
} from 'lucide-react'
import { PAGE_COLORS } from '../utils/colors'
import LevelSelector from './LevelSelector'
import { onAuthChange, signOutUser } from '../utils/auth'
import { isFirebaseConfigured } from '../firebase'

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'dashboard',        Icon: LayoutDashboard },
  { id: 'flashcards', label: 'flashcards',        Icon: Layers          },
  { id: 'praticar',   label: 'praticar',          Icon: Dumbbell        },
  { id: 'roadmap',    label: 'roadmap',           Icon: Map             },
  { id: 'diario',     label: 'diário de bordo',   Icon: BookOpen        },
  { id: 'anotacoes',  label: 'anotações',         Icon: NotebookPen     },
  { id: 'erros',      label: 'banco de erros',    Icon: AlertCircle     },
  { id: 'glossario',  label: 'glossário pessoal', Icon: BookMarked      },
  { id: 'conquistas', label: 'conquistas',        Icon: Award           },
  { id: 'vip',        label: 'prep vip',          Icon: Star            },
  { id: 'frase',      label: 'frase do dia',      Icon: MessageSquare   },
  { id: 'metas',      label: 'metas semanais',    Icon: Target          },
]

export default function Sidebar({ activePage, setActivePage }) {
  const activeColor = (PAGE_COLORS[activePage] || PAGE_COLORS.dashboard).primary
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!isFirebaseConfigured) return
    return onAuthChange(setUser)
  }, [])

  return (
    <aside className="w-60 h-full flex flex-col overflow-hidden flex-shrink-0"
      style={{ backgroundColor: 'white', borderRight: '1.5px solid #E5E7EB', boxShadow: '2px 0 8px rgba(0,0,0,0.06)' }}>

      {/* Brand */}
      <div className="px-5 py-6" style={{ borderBottom: '1.5px solid #F3F4F6' }}>
        <p className="font-heading text-2xl leading-tight lowercase"
          style={{ fontWeight: 900, color: activeColor, transition: 'color 0.3s' }}>
          english journey
        </p>
        <div className="mt-3">
          <LevelSelector compact activeColor={activeColor} />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activePage === id
          const pc = PAGE_COLORS[id] || PAGE_COLORS.dashboard
          return (
            <button
              key={id}
              onClick={() => setActivePage(id)}
              className="w-full flex items-center gap-3 px-4 py-3 font-body text-sm font-medium transition-all text-left"
              style={isActive ? {
                backgroundColor: pc.accent,
                borderLeft: `4px solid ${pc.primary}`,
                color: pc.primary,
                fontWeight: 700,
                paddingLeft: '12px',
              } : {
                color: '#6B7280',
                borderLeft: '4px solid transparent',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = pc.accent
                  e.currentTarget.style.color = pc.primary
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = ''
                  e.currentTarget.style.color = '#6B7280'
                }
              }}
            >
              <Icon size={18} />
              <span className="leading-tight">{label}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: '1.5px solid #F3F4F6' }}>
        {user && (
          <button onClick={() => signOutUser()}
            className="w-full flex items-center justify-center gap-1.5 font-body text-xs mb-2 py-1.5 transition-colors"
            style={{ color: '#9CA3AF', borderRadius: '6px' }}
            title={user.email || 'sair'}>
            <LogOut size={12} /> sair
          </button>
        )}
        <p className="text-xs text-center font-body italic" style={{ color: activeColor, opacity: 0.7, transition: 'color 0.3s' }}>
          great minds english ♥
        </p>
      </div>
    </aside>
  )
}

import {
  LayoutDashboard, Layers, Map, BookOpen,
  AlertCircle, BookMarked, Star, MessageSquare, Target,
} from 'lucide-react'
import { PAGE_COLORS } from '../utils/colors'

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'dashboard',        Icon: LayoutDashboard },
  { id: 'flashcards', label: 'flashcards',        Icon: Layers          },
  { id: 'roadmap',    label: 'roadmap',           Icon: Map             },
  { id: 'diario',     label: 'diário de bordo',   Icon: BookOpen        },
  { id: 'erros',      label: 'banco de erros',    Icon: AlertCircle     },
  { id: 'glossario',  label: 'glossário pessoal', Icon: BookMarked      },
  { id: 'vip',        label: 'prep vip',          Icon: Star            },
  { id: 'frase',      label: 'frase do dia',      Icon: MessageSquare   },
  { id: 'metas',      label: 'metas semanais',    Icon: Target          },
]

export default function Sidebar({ activePage, setActivePage }) {
  const activeColor = (PAGE_COLORS[activePage] || PAGE_COLORS.dashboard).primary

  return (
    <aside className="w-60 h-full flex flex-col overflow-hidden flex-shrink-0"
      style={{ backgroundColor: 'white', borderRight: '1.5px solid #E5E7EB', boxShadow: '2px 0 8px rgba(0,0,0,0.06)' }}>

      {/* Brand */}
      <div className="px-5 py-6" style={{ borderBottom: '1.5px solid #F3F4F6' }}>
        <p className="font-heading text-2xl leading-tight lowercase"
          style={{ fontWeight: 900, color: activeColor, transition: 'color 0.3s' }}>
          english journey
        </p>
        <span className="inline-block mt-2 px-2 py-0.5 text-xs font-body font-bold"
          style={{ backgroundColor: '#F3F4F6', color: '#6B7280', borderRadius: '6px' }}>
          nível a1
        </span>
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
        <p className="text-xs text-center font-body italic" style={{ color: activeColor, opacity: 0.7, transition: 'color 0.3s' }}>
          great minds english ♥
        </p>
      </div>
    </aside>
  )
}

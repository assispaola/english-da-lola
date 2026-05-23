import {
  LayoutDashboard, Layers, Map, BookOpen,
  AlertCircle, BookMarked, Star, MessageSquare, Target,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'dashboard',         Icon: LayoutDashboard },
  { id: 'flashcards', label: 'flashcards',         Icon: Layers          },
  { id: 'roadmap',    label: 'roadmap',            Icon: Map             },
  { id: 'diario',     label: 'diário de bordo',    Icon: BookOpen        },
  { id: 'erros',      label: 'banco de erros',     Icon: AlertCircle     },
  { id: 'glossario',  label: 'glossário pessoal',  Icon: BookMarked      },
  { id: 'vip',        label: 'prep vip',           Icon: Star            },
  { id: 'frase',      label: 'frase do dia',       Icon: MessageSquare   },
  { id: 'metas',      label: 'metas semanais',     Icon: Target          },
]

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="w-60 h-full flex flex-col overflow-hidden shadow-lg flex-shrink-0"
      style={{ backgroundColor: '#FFF0F6', borderRight: '1.5px solid #F8BBD0' }}>

      {/* Brand */}
      <div className="px-5 py-6" style={{ borderBottom: '1.5px solid #F8BBD0' }}>
        <p className="font-heading text-2xl leading-tight lowercase"
          style={{ fontFamily: 'Canela, "Fredoka One", serif', fontWeight: 900, color: '#E91E8C' }}>
          english journey
        </p>
        <span className="inline-block mt-2 px-2 py-0.5 text-xs font-body font-bold rounded-full"
          style={{ backgroundColor: '#FCE4EC', color: '#C2185B' }}>
          nível a1
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activePage === id
          return (
            <button
              key={id}
              onClick={() => setActivePage(id)}
              className="w-full flex items-center gap-3 px-4 py-3 font-body text-sm font-medium transition-all text-left"
              style={isActive ? {
                backgroundColor: '#FCE4EC',
                borderLeft: '4px solid #E91E8C',
                color: '#E91E8C',
                fontWeight: 700,
                paddingLeft: '12px',
              } : {
                color: '#6B7280',
                borderLeft: '4px solid transparent',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.backgroundColor = '#FCE4EC'; e.currentTarget.style.color = '#E91E8C' } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '#6B7280' } }}
            >
              <Icon size={18} />
              <span className="leading-tight">{label}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: '1.5px solid #F8BBD0' }}>
        <p className="text-xs text-center font-body italic" style={{ color: '#C2185B', opacity: 0.7 }}>
          great minds english ♥
        </p>
      </div>
    </aside>
  )
}

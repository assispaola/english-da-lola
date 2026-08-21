import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, List, ListOrdered, Strikethrough,
  Heading2, Heading3, Minus, RotateCcw, RotateCw,
  Check, Star, AlertTriangle, ArrowRight, Smile, Shapes,
} from 'lucide-react'

const ICON_OPTIONS = [
  { glyph: '✓', label: 'check', Icon: Check },
  { glyph: '★', label: 'estrela', Icon: Star },
  { glyph: '⚠', label: 'alerta', Icon: AlertTriangle },
  { glyph: '→', label: 'seta', Icon: ArrowRight },
]

const EMOJI_OPTIONS = ['📚', '✅', '⭐', '💡', '🎯', '❤️', '😊', '🔥', '📝', '🗣️', '🌟', '💪']

function ToolbarButton({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className="flex items-center justify-center transition-all"
      style={{
        width: '30px', height: '30px', borderRadius: '6px',
        background: active ? 'rgba(233,30,140,0.12)' : 'transparent',
        color: active ? '#E91E8C' : '#6B7280',
        border: 'none', cursor: 'pointer', flexShrink: 0,
        fontSize: '15px', fontWeight: 700, lineHeight: 1,
      }}>
      {children}
    </button>
  )
}

function Divider() {
  return <div style={{ width: '1px', height: '20px', backgroundColor: '#E5E7EB', margin: '0 2px', flexShrink: 0 }} />
}

// Closes a picker when a click lands outside its whole group (trigger
// button + popover together, via groupRef) — NOT just outside the popover
// itself. The click that opens the picker (mouseup after the trigger's own
// mousedown) also bubbles to document as a 'click'; if only the popover
// were checked, that click would immediately count as "outside" (the
// trigger button isn't inside the popover) and close it right away.
function useOutsideClose(groupRef, open, onClose) {
  useEffect(() => {
    if (!open) return
    const onDocClick = (e) => { if (groupRef.current && !groupRef.current.contains(e.target)) onClose() }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [groupRef, open, onClose])
}

// Small popover with a grid of options, anchored under its toolbar button.
// Centered under the button (not left-aligned) and width-capped to the
// viewport — the toolbar wraps to multiple rows on narrow screens, so this
// button can land anywhere (including near the right edge), and a
// left-aligned fixed-width popover would otherwise risk spilling off-screen.
function Picker({ open, border, children }) {
  if (!open) return null

  return (
    <div className="absolute z-20 flex flex-wrap gap-1 p-2"
      onMouseDown={e => e.preventDefault()}
      style={{
        top: 'calc(100% + 4px)', left: '50%', transform: 'translateX(-50%)',
        width: '168px', maxWidth: 'calc(100vw - 32px)',
        backgroundColor: 'white', border: `1.5px solid ${border}`, borderRadius: '10px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      }}>
      {children}
    </div>
  )
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  rows = 5,
  maxHeight = 350,
  accentColor,
  borderColor,
  primaryColor,
}) {
  const minHeight = `${rows * 1.7}rem`
  const accent = accentColor || '#FDF2F8'
  const border = borderColor || '#F9A8D4'
  const primary = primaryColor || '#E91E8C'
  const [openPicker, setOpenPicker] = useState(null) // null | 'icon' | 'emoji'
  const closePicker = useCallback(() => setOpenPicker(null), [])
  const iconGroupRef  = useRef(null)
  const emojiGroupRef = useRef(null)
  useOutsideClose(iconGroupRef,  openPicker === 'icon',  closePicker)
  useOutsideClose(emojiGroupRef, openPicker === 'emoji', closePicker)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder || 'Escreva aqui…' }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange && onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'rich-editor-body font-body text-sm leading-relaxed focus:outline-none',
        style: `min-height: ${minHeight}; color: #1A1A2E; padding: 10px 12px;`,
      },
    },
  })

  // Sync external value changes (e.g. loading saved data)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== undefined && value !== current) {
      editor.commands.setContent(value || '', false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  if (!editor) return null

  const btn = (onClick, active, title, Icon) => (
    <ToolbarButton onClick={onClick} active={active} title={title}>
      <Icon size={14} />
    </ToolbarButton>
  )

  const insertText = (text) => {
    editor.chain().focus().insertContent(text).run()
    setOpenPicker(null)
  }

  return (
    <div style={{ border: `1.5px solid ${border}`, borderRadius: '10px', backgroundColor: 'white' }}>
      {/* Toolbar — sticky at the top of the editor, never scrolls out of view */}
      <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 relative"
        style={{ borderBottom: `1px solid ${border}`, backgroundColor: accent, borderRadius: '10px 10px 0 0' }}>
        {btn(() => editor.chain().focus().toggleBold().run(),        editor.isActive('bold'),        'Bold',          Bold)}
        {btn(() => editor.chain().focus().toggleItalic().run(),      editor.isActive('italic'),      'Italic',        Italic)}
        {btn(() => editor.chain().focus().toggleStrike().run(),      editor.isActive('strike'),      'Strikethrough', Strikethrough)}
        <Divider />
        {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }), 'Heading 2', Heading2)}
        {btn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }), 'Heading 3', Heading3)}
        <Divider />
        {btn(() => editor.chain().focus().toggleBulletList().run(),  editor.isActive('bulletList'),  'Bullet list',   List)}
        {btn(() => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'), 'Ordered list',  ListOrdered)}
        <Divider />
        {btn(() => editor.chain().focus().setHorizontalRule().run(), false, 'Linha horizontal', Minus)}
        <ToolbarButton onClick={() => insertText('—')} active={false} title="Inserir travessão (—)">—</ToolbarButton>
        <Divider />

        {/* Icon picker */}
        <div className="relative" ref={iconGroupRef}>
          <ToolbarButton onClick={() => setOpenPicker(p => p === 'icon' ? null : 'icon')} active={openPicker === 'icon'} title="Inserir ícone">
            <Shapes size={14} />
          </ToolbarButton>
          <Picker open={openPicker === 'icon'} border={border}>
            {ICON_OPTIONS.map(({ glyph, label, Icon }) => (
              <button key={label} type="button" title={label}
                onClick={() => insertText(glyph)}
                className="flex items-center justify-center transition-all hover:scale-105"
                style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', cursor: 'pointer', color: primary, backgroundColor: accent }}>
                <Icon size={16} />
              </button>
            ))}
          </Picker>
        </div>

        {/* Emoji picker */}
        <div className="relative" ref={emojiGroupRef}>
          <ToolbarButton onClick={() => setOpenPicker(p => p === 'emoji' ? null : 'emoji')} active={openPicker === 'emoji'} title="Inserir emoji">
            <Smile size={14} />
          </ToolbarButton>
          <Picker open={openPicker === 'emoji'} border={border}>
            {EMOJI_OPTIONS.map(emoji => (
              <button key={emoji} type="button" title={emoji}
                onClick={() => insertText(emoji)}
                className="flex items-center justify-center transition-all hover:scale-110"
                style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '16px', backgroundColor: accent }}>
                {emoji}
              </button>
            ))}
          </Picker>
        </div>

        <Divider />
        {btn(() => editor.chain().focus().undo().run(), false, 'Undo', RotateCcw)}
        {btn(() => editor.chain().focus().redo().run(), false, 'Redo', RotateCw)}
      </div>

      {/* Editor area — scrolls internally once content passes maxHeight,
          so the toolbar above never gets pushed out of view */}
      <div style={{ maxHeight: `${maxHeight}px`, overflowY: 'auto', borderRadius: '0 0 10px 10px' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

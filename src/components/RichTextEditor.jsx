import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, List, ListOrdered, Strikethrough,
  Heading2, Heading3, Minus, RotateCcw, RotateCw,
} from 'lucide-react'

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
      }}>
      {children}
    </button>
  )
}

function Divider() {
  return <div style={{ width: '1px', height: '20px', backgroundColor: '#E5E7EB', margin: '0 2px', flexShrink: 0 }} />
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  rows = 5,
  accentColor,
  borderColor,
  primaryColor,
}) {
  const minHeight = `${rows * 1.7}rem`
  const accent = accentColor || '#FDF2F8'
  const border = borderColor || '#F9A8D4'
  const primary = primaryColor || '#E91E8C'

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

  return (
    <div style={{ border: `1.5px solid ${border}`, borderRadius: '10px', overflow: 'hidden', backgroundColor: 'white' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5"
        style={{ borderBottom: `1px solid ${border}`, backgroundColor: accent }}>
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
        {btn(() => editor.chain().focus().setHorizontalRule().run(), false, 'Horizontal rule', Minus)}
        <Divider />
        {btn(() => editor.chain().focus().undo().run(), false, 'Undo', RotateCcw)}
        {btn(() => editor.chain().focus().redo().run(), false, 'Redo', RotateCw)}
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  )
}

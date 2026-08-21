// Human-facing export formats (.txt / print-to-PDF) for sharing specific
// pieces of progress with someone else — e.g. one diário entry sent to a
// teacher for correction. Distinct from backup.js, which exports/imports
// the full technical JSON snapshot for data safety, not for reading.
import { getRoadmapForLevel, findRoadmapTopic } from '../data/roadmapData'
import { DEFAULT_LEVEL } from './levels'

// ─── HTML → plain text (good enough for Tiptap's simple output: p/br/li/h*) ─
export function stripHtml(html) {
  if (!html) return ''
  return html
    .replace(/<\/(p|li|h[1-6]|div)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function downloadTxt(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Opens a print-ready window and triggers the browser's print dialog — the
// user picks "Salvar como PDF" as the destination. No PDF library needed.
export function openPrintable(html) {
  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
  setTimeout(() => { win.print() }, 500)
}

const PRINT_STYLES = `
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:Arial,sans-serif; color:#1A1A2E; padding:40px; max-width:860px; margin:0 auto; }
  h1   { color:#E91E8C; font-size:1.8rem; margin-bottom:2px; }
  .subtitle { color:#6B7280; font-size:0.85rem; margin-bottom:28px; }
  h2   { color:#C2185B; font-size:1.1rem; margin:24px 0 10px; padding-bottom:6px; border-bottom:2px solid #F8BBD0; }
  h3   { font-size:0.95rem; color:#1A1A2E; }
  .stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin:16px 0; }
  .stat-card  { background:#FFF0F6; border:1.5px solid #F8BBD0; border-radius:12px; padding:16px; text-align:center; }
  .stat-num   { font-size:2.2rem; font-weight:700; color:#E91E8C; line-height:1; }
  .stat-lbl   { font-size:0.75rem; color:#6B7280; margin-top:4px; }
  .progress-bar     { height:10px; background:#F8BBD0; border-radius:99px; margin:8px 0; overflow:hidden; }
  .progress-bar div { height:100%; background:linear-gradient(to right,#E91E8C,#C2185B); border-radius:99px; }
  .section-card { background:#FFF0F6; border:1.5px solid #F8BBD0; border-radius:12px; padding:14px; margin:10px 0; }
  .flex-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
  .badge { background:#FCE4EC; color:#C2185B; border-radius:99px; padding:2px 10px; font-size:0.78rem; font-weight:600; display:inline-block; margin:2px 4px 2px 0; }
  ul   { list-style:none; margin-top:8px; }
  li   { font-size:0.85rem; padding:2px 0; color:#374151; }
  .conf-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin:12px 0; }
  .conf-card { border-radius:10px; padding:14px; text-align:center; }
  .conf-sei  { background:#D1FAE5; } .conf-mmm { background:#FEF3C7; } .conf-nao { background:#FEE2E2; }
  .conf-num  { font-size:1.8rem; font-weight:700; }
  .entry-card { border:1.5px solid #F8BBD0; border-radius:12px; padding:18px; margin:16px 0; page-break-inside:avoid; }
  .entry-meta { color:#9CA3AF; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:10px; }
  .highlight-box { background:#FFF9E6; border:1.5px solid #FDE68A; border-radius:10px; padding:16px; font-size:1.05rem; line-height:1.6; }
  .highlight-box p { margin: 0 0 0.6em; }
  .highlight-box p:last-child { margin-bottom: 0; }
  .doubts-box { background:#F0F9FF; border:1.5px dashed #93C5FD; border-radius:10px; padding:16px; margin-top:6px; font-size:0.92rem; line-height:1.55; color:#374151; }
  .doubts-box p { margin: 0 0 0.5em; }
  @media print {
    body { padding:20px; }
    h2   { break-before:auto; }
  }
`

export function printShell(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>${PRINT_STYLES}</style>
</head>
<body>
  <h1>english journey ♥</h1>
  <p class="subtitle">${title}</p>
  ${bodyHtml}
</body>
</html>`
}

// ─── Diário de bordo ──────────────────────────────────────────────────────
// Layout aimed at sharing with a teacher: the English text stands out in a
// highlighted box, with a visually separate section underneath for the
// student's own doubts/questions (reuses the existing `corrections` field,
// which already serves as free-form notes attached to the entry) — so a
// teacher scanning the page immediately sees "here's what she wrote" vs.
// "here's what she's unsure about", without the two blending together.
function formatDiarioDate(dateStr) {
  try {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return dateStr }
}

export function diarioEntryHtml(entry) {
  return `
  <div class="entry-card">
    <div class="entry-meta">${formatDiarioDate(entry.date)} · nível ${entry.level || DEFAULT_LEVEL}</div>
    <h3 style="margin-bottom:8px;">📝 texto em inglês</h3>
    <div class="highlight-box">${entry.content || '<p style="color:#9CA3AF">(vazio)</p>'}</div>
    <h3 style="margin:14px 0 6px;">💬 dúvidas / pontos para a professora revisar</h3>
    <div class="doubts-box">${entry.corrections || '<p style="color:#9CA3AF">(nenhuma anotação)</p>'}</div>
  </div>`
}

export function diarioEntryTxt(entry) {
  return [
    `DIÁRIO — ${formatDiarioDate(entry.date)} (nível ${entry.level || DEFAULT_LEVEL})`,
    '',
    '— TEXTO EM INGLÊS —',
    stripHtml(entry.content) || '(vazio)',
    '',
    '— DÚVIDAS / PONTOS PARA A PROFESSORA REVISAR —',
    stripHtml(entry.corrections) || '(nenhuma anotação)',
  ].join('\n')
}

// ─── Anotações ────────────────────────────────────────────────────────────
export function noteTitle(note) {
  if (!note.topicId) return 'anotação avulsa'
  const topic = findRoadmapTopic(note.topicId, note.level)
  return topic ? topic.title : 'anotação avulsa'
}

export function noteEntryHtml(note) {
  const date = note.timestamp ? new Date(note.timestamp).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  const tags = (note.tags || []).map(t => `<span class="badge">#${t}</span>`).join('')
  return `
  <div class="entry-card">
    <div class="entry-meta">${date} · nível ${note.level || DEFAULT_LEVEL}${note.favorite ? ' · ⭐ favorita' : ''}</div>
    <h3 style="margin-bottom:8px;">${noteTitle(note)}</h3>
    ${tags ? `<p style="margin-bottom:8px;">${tags}</p>` : ''}
    <div class="highlight-box">${note.content || '<p style="color:#9CA3AF">(vazio)</p>'}</div>
  </div>`
}

export function noteEntryTxt(note) {
  const date = note.timestamp ? new Date(note.timestamp).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  const tags = (note.tags || []).length ? ` [${note.tags.join(', ')}]` : ''
  return [
    `${noteTitle(note)} — ${date} (nível ${note.level || DEFAULT_LEVEL})${tags}`,
    stripHtml(note.content) || '(vazio)',
  ].join('\n')
}

// ─── Banco de erros ───────────────────────────────────────────────────────
export function errosHtml(errors) {
  const rows = errors.map(e => `<li>${e.archived ? '✅' : '🔴'} <strong>[${e.type}]</strong> ${e.description}${e.recurrenceCount > 1 ? ` <span class="badge">${e.recurrenceCount}x</span>` : ''}</li>`).join('')
  return `<h2>🔴 banco de erros</h2><ul>${rows || '<li>Nenhum erro registrado</li>'}</ul>`
}

export function errosTxt(errors) {
  if (!errors.length) return 'Nenhum erro registrado'
  return errors.map(e => `[${e.archived ? 'resolvido' : 'pendente'}] (${e.type}) ${e.description}${e.recurrenceCount > 1 ? ` — ocorreu ${e.recurrenceCount}x` : ''}`).join('\n')
}

// ─── Flashcards ───────────────────────────────────────────────────────────
export function flashcardsHtml(cards) {
  const rows = cards.map(c => `<li><strong>${c.front}</strong> — ${c.back}</li>`).join('')
  return `<h2>🃏 flashcards</h2><ul>${rows || '<li>Nenhum flashcard</li>'}</ul>`
}

export function flashcardsTxt(cards) {
  if (!cards.length) return 'Nenhum flashcard'
  return cards.map(c => `${c.front} — ${c.back}`).join('\n')
}

// ─── Progresso geral (roadmap) ───────────────────────────────────────────
function getStreak(dates) {
  if (!dates.length) return 0
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    if (dates.includes(d.toISOString().split('T')[0])) streak++
    else break
  }
  return streak
}

function loadProgressData(level) {
  const legacyRoadmapKey = level === DEFAULT_LEVEL ? 'ej_roadmap' : null
  const roadmapDefault = getRoadmapForLevel(level)
  const roadmap = JSON.parse(localStorage.getItem(`ej_roadmap__${level}`)
    || (legacyRoadmapKey && localStorage.getItem(legacyRoadmapKey))
    || 'null') || roadmapDefault
  const flashcards = (JSON.parse(localStorage.getItem('ej_flashcards') || '[]'))
    .filter(c => (c.level || DEFAULT_LEVEL) === level)
  const glossario = (JSON.parse(localStorage.getItem('ej_glossario') || '[]'))
    .filter(w => (w.level || DEFAULT_LEVEL) === level)
  const metas    = JSON.parse(localStorage.getItem('ej_metas') || '{"goals":[]}')
  const actDates = JSON.parse(localStorage.getItem('ej_activity_dates') || '[]')

  let totalTopics = 0, completedTopics = 0
  const tabStats = {}
  Object.entries(roadmap).forEach(([tab, items]) => {
    const done = items.filter(i => i.status === 'Concluído')
    totalTopics += items.length
    completedTopics += done.length
    tabStats[tab] = { total: items.length, done: done.length, completedItems: done }
  })
  const overallPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

  const conf = { sei: 0, mais_ou_menos: 0, nao_sei: 0, nenhum: 0 }
  flashcards.forEach(c => {
    if      (c.confidence === 'sei')           conf.sei++
    else if (c.confidence === 'mais_ou_menos') conf.mais_ou_menos++
    else if (c.confidence === 'nao_sei')       conf.nao_sei++
    else                                       conf.nenhum++
  })

  return { tabStats, overallPct, conf, flashcards, glossario, metas, streak: getStreak(actDates) }
}

export function progressoGeralHtml(level) {
  const { tabStats, overallPct, conf, flashcards, glossario, metas, streak } = loadProgressData(level)

  const tabRows = Object.entries(tabStats).map(([tab, s]) => {
    const pct = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0
    const items = s.completedItems.map(i => `<li>✅ ${i.title}</li>`).join('') || '<li style="color:#9CA3AF">Nenhum tópico concluído ainda</li>'
    return `
      <div class="section-card">
        <div class="flex-row">
          <h3>${tab}</h3>
          <span class="badge">${s.done}/${s.total} — ${pct}%</span>
        </div>
        <div class="progress-bar"><div style="width:${pct}%"></div></div>
        <ul>${items}</ul>
      </div>`
  }).join('')

  const goalsDone  = (metas.goals || []).filter(g => g.done).length
  const goalsTotal = (metas.goals || []).length
  const goalRows   = (metas.goals || []).map(g => `<li>${g.done ? '✅' : '⬜'} ${g.text}</li>`).join('') || '<li>Sem metas definidas</li>'

  return `
  <h2>📊 progresso geral — nível ${level}</h2>
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-num">${overallPct}%</div><div class="stat-lbl">roadmap completo</div></div>
    <div class="stat-card"><div class="stat-num">${streak}</div><div class="stat-lbl">dias de streak 🔥</div></div>
    <div class="stat-card"><div class="stat-num">${flashcards.length}</div><div class="stat-lbl">flashcards criados</div></div>
  </div>

  <h2>🗺️ roadmap por habilidade</h2>
  ${tabRows}

  <h2>🃏 flashcards — nível de confiança</h2>
  <div class="conf-grid">
    <div class="conf-card conf-sei"><div class="conf-num">${conf.sei}</div><div>✅ sei bem</div></div>
    <div class="conf-card conf-mmm"><div class="conf-num">${conf.mais_ou_menos}</div><div>🤔 mais ou menos</div></div>
    <div class="conf-card conf-nao"><div class="conf-num">${conf.nao_sei}</div><div>❌ não sei ainda</div></div>
  </div>

  <h2>📚 glossário pessoal</h2>
  <p>${glossario.length} palavra${glossario.length !== 1 ? 's' : ''} adicionada${glossario.length !== 1 ? 's' : ''}</p>

  <h2>🎯 metas semanais — ${goalsDone}/${goalsTotal}</h2>
  <ul>${goalRows}</ul>`
}

export function progressoGeralTxt(level) {
  const { tabStats, overallPct, conf, flashcards, glossario, metas, streak } = loadProgressData(level)
  const lines = [`PROGRESSO GERAL — nível ${level}`, '']
  lines.push(`roadmap completo: ${overallPct}%`, `streak: ${streak} dias`, `flashcards criados: ${flashcards.length}`, '')
  lines.push('— ROADMAP POR HABILIDADE —')
  Object.entries(tabStats).forEach(([tab, s]) => {
    const pct = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0
    lines.push(`${tab}: ${s.done}/${s.total} (${pct}%)`)
  })
  lines.push('', '— FLASHCARDS: NÍVEL DE CONFIANÇA —')
  lines.push(`sei bem: ${conf.sei} · mais ou menos: ${conf.mais_ou_menos} · não sei ainda: ${conf.nao_sei}`)
  lines.push('', `glossário pessoal: ${glossario.length} palavra(s)`)
  const goalsDone = (metas.goals || []).filter(g => g.done).length
  lines.push('', `metas semanais: ${goalsDone}/${(metas.goals || []).length}`)
  ;(metas.goals || []).forEach(g => lines.push(`  ${g.done ? '[x]' : '[ ]'} ${g.text}`))
  return lines.join('\n')
}

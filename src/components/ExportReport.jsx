import { useState } from 'react'
import { Download } from 'lucide-react'
import { ROADMAP_INITIAL } from '../data/roadmapData'

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

function printHTML(html) {
  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
  setTimeout(() => { win.print() }, 500)
}

export default function ExportReport() {
  const [loading, setLoading] = useState(false)

  const generate = () => {
    setLoading(true)
    try {
      const roadmap    = JSON.parse(localStorage.getItem('ej_roadmap') || 'null') || ROADMAP_INITIAL
      const flashcards = JSON.parse(localStorage.getItem('ej_flashcards') || '[]')
      const glossario  = JSON.parse(localStorage.getItem('ej_glossario') || '[]')
      const metas      = JSON.parse(localStorage.getItem('ej_metas') || '{"goals":[]}')
      const erros      = JSON.parse(localStorage.getItem('ej_erros') || '[]')
      const actDates   = JSON.parse(localStorage.getItem('ej_activity_dates') || '[]')

      // Roadmap stats
      let totalTopics = 0, completedTopics = 0
      const tabStats = {}
      Object.entries(roadmap).forEach(([tab, items]) => {
        const done = items.filter(i => i.status === 'Concluído')
        totalTopics += items.length
        completedTopics += done.length
        tabStats[tab] = { total: items.length, done: done.length, completedItems: done }
      })
      const overallPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

      // Confidence breakdown
      const conf = { sei: 0, mais_ou_menos: 0, nao_sei: 0, nenhum: 0 }
      flashcards.forEach(c => {
        if      (c.confidence === 'sei')           conf.sei++
        else if (c.confidence === 'mais_ou_menos') conf.mais_ou_menos++
        else if (c.confidence === 'nao_sei')       conf.nao_sei++
        else                                       conf.nenhum++
      })

      const streak         = getStreak(actDates)
      const unresolvedErrs = erros.filter(e => !e.resolved)
      const goalsDone      = (metas.goals || []).filter(g => g.done).length
      const goalsTotal     = (metas.goals || []).length
      const today          = new Date().toLocaleDateString('pt-BR', { day:'numeric', month:'long', year:'numeric' })

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

      const errRows   = unresolvedErrs.map(e => `<li>🔴 <strong>[${e.category}]</strong> ${e.text}</li>`).join('') || '<li style="color:#26C6A0">✨ Nenhum erro pendente — ótimo!</li>'
      const goalRows  = (metas.goals || []).map(g => `<li>${g.done ? '✅' : '⬜'} ${g.text}</li>`).join('') || '<li>Sem metas definidas</li>'

      printHTML(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>English Journey A1 — Relatório de Progresso</title>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:Arial,sans-serif; color:#1A1A2E; padding:40px; max-width:860px; margin:0 auto; }
  h1   { color:#E91E8C; font-size:2rem; margin-bottom:2px; }
  .subtitle { color:#6B7280; font-size:0.85rem; margin-bottom:32px; }
  h2   { color:#C2185B; font-size:1.15rem; margin:28px 0 12px; padding-bottom:6px; border-bottom:2px solid #F8BBD0; }
  h3   { font-size:0.95rem; color:#1A1A2E; }
  .stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin:16px 0; }
  .stat-card  { background:#FFF0F6; border:1.5px solid #F8BBD0; border-radius:12px; padding:16px; text-align:center; }
  .stat-num   { font-size:2.2rem; font-weight:700; color:#E91E8C; line-height:1; }
  .stat-lbl   { font-size:0.75rem; color:#6B7280; margin-top:4px; }
  .progress-bar     { height:10px; background:#F8BBD0; border-radius:99px; margin:8px 0; overflow:hidden; }
  .progress-bar div { height:100%; background:linear-gradient(to right,#E91E8C,#C2185B); border-radius:99px; }
  .section-card { background:#FFF0F6; border:1.5px solid #F8BBD0; border-radius:12px; padding:14px; margin:10px 0; }
  .flex-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
  .badge { background:#FCE4EC; color:#C2185B; border-radius:99px; padding:2px 10px; font-size:0.78rem; font-weight:600; }
  ul   { list-style:none; margin-top:8px; }
  li   { font-size:0.83rem; padding:2px 0; color:#374151; }
  .conf-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin:12px 0; }
  .conf-card { border-radius:10px; padding:14px; text-align:center; }
  .conf-sei  { background:#D1FAE5; } .conf-mmm { background:#FEF3C7; } .conf-nao { background:#FEE2E2; }
  .conf-num  { font-size:1.8rem; font-weight:700; }
  @media print {
    body { padding:20px; }
    h2   { break-before:auto; }
  }
</style>
</head>
<body>
  <h1>english journey — a1 🌸</h1>
  <p class="subtitle">Relatório gerado em ${today}</p>

  <h2>📊 Progresso Geral</h2>
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-num">${overallPct}%</div><div class="stat-lbl">roadmap A1 completo</div></div>
    <div class="stat-card"><div class="stat-num">${streak}</div><div class="stat-lbl">dias de streak 🔥</div></div>
    <div class="stat-card"><div class="stat-num">${flashcards.length}</div><div class="stat-lbl">flashcards criados</div></div>
  </div>

  <h2>🗺️ Roadmap por Habilidade</h2>
  ${tabRows}

  <h2>🃏 Flashcards — Nível de Confiança</h2>
  <div class="conf-grid">
    <div class="conf-card conf-sei"><div class="conf-num">${conf.sei}</div><div>✅ sei bem</div></div>
    <div class="conf-card conf-mmm"><div class="conf-num">${conf.mais_ou_menos}</div><div>🤔 mais ou menos</div></div>
    <div class="conf-card conf-nao"><div class="conf-num">${conf.nao_sei}</div><div>❌ não sei ainda</div></div>
  </div>

  <h2>📚 Glossário Pessoal</h2>
  <p>${glossario.length} palavra${glossario.length !== 1 ? 's' : ''} adicionada${glossario.length !== 1 ? 's' : ''}</p>

  <h2>🎯 Metas Semanais — ${goalsDone}/${goalsTotal}</h2>
  <ul>${goalRows}</ul>

  <h2>🔴 Erros Recorrentes Pendentes</h2>
  <ul>${errRows}</ul>
</body>
</html>`)
    } finally {
      setTimeout(() => setLoading(false), 800)
    }
  }

  return (
    <button onClick={generate} disabled={loading} className="btn-primary gap-2">
      <Download size={16} />
      {loading ? 'gerando…' : 'exportar progresso'}
    </button>
  )
}

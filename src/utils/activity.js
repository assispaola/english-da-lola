export function recordActivity() {
  const today = new Date().toISOString().split('T')[0]
  try {
    const raw = localStorage.getItem('ej_activity_dates')
    const dates = raw ? JSON.parse(raw) : []
    if (!dates.includes(today)) {
      dates.push(today)
      localStorage.setItem('ej_activity_dates', JSON.stringify(dates))
    }
  } catch {}
}

export function getStreak() {
  try {
    const raw = localStorage.getItem('ej_activity_dates')
    const dates = raw ? JSON.parse(raw) : []
    if (dates.length === 0) return 0

    let streak = 0
    const today = new Date()

    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      if (dates.includes(dateStr)) {
        streak++
      } else {
        break
      }
    }
    return streak
  } catch {
    return 0
  }
}

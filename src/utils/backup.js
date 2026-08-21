import { LEVELS } from './levels'

const DATA_KEYS = [
  'ej_flashcards', 'ej_roadmap', 'ej_glossario', 'ej_diario',
  'ej_metas', 'ej_erros', 'ej_frases', 'ej_vip_sessions',
  'ej_vip_current', 'ej_next_class', 'ej_classes', 'ej_activity',
  'ej_topics', 'ej_exercises', 'ej_attempts', 'ej_error_log', 'ej_notes',
  'ej_speaking_assessments',
  'ej_current_level', 'ej_levels_unlocked',
  ...LEVELS.map(level => `ej_roadmap__${level}`), // per-level roadmap progress
]

export function createBackup() {
  try {
    const backup = { lastSave: new Date().toISOString() }
    DATA_KEYS.forEach(key => {
      try {
        const val = localStorage.getItem(key)
        if (val) backup[key] = JSON.parse(val)
      } catch {}
    })
    localStorage.setItem(`app_backup_${Date.now()}`, JSON.stringify(backup))
    // Keep only the 5 most recent backups
    const backupKeys = Object.keys(localStorage)
      .filter(k => k.startsWith('app_backup_'))
      .sort()
    if (backupKeys.length > 5) {
      backupKeys.slice(0, backupKeys.length - 5).forEach(k => localStorage.removeItem(k))
    }
    return true
  } catch { return false }
}

export function getLatestBackup() {
  try {
    const keys = Object.keys(localStorage)
      .filter(k => k.startsWith('app_backup_'))
      .sort()
    if (!keys.length) return null
    return JSON.parse(localStorage.getItem(keys[keys.length - 1]))
  } catch { return null }
}

export function exportBackup() {
  try {
    const backup = { exportedAt: new Date().toISOString() }
    DATA_KEYS.forEach(key => {
      try {
        const val = localStorage.getItem(key)
        if (val) backup[key] = JSON.parse(val)
      } catch {}
    })
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `english-journey-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err) { console.error('Export backup failed:', err) }
}

export function importBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        DATA_KEYS.forEach(key => {
          if (data[key] !== undefined) {
            localStorage.setItem(key, JSON.stringify(data[key]))
          }
        })
        resolve(true)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo'))
    reader.readAsText(file)
  })
}

export function initBackupSchedule() {
  createBackup() // immediate snapshot on load
  const id = setInterval(createBackup, 30 * 60 * 1000)
  return () => clearInterval(id)
}

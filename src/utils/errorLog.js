import { createStore, nowISO } from './storage'
import { createErrorLog } from '../data/schema'

const store = createStore('ej_error_log', 'errorLog')

export const getErrorLogs    = store.getAll
export const getErrorLogById = store.getById

export function addErrorLog(fields) {
  return store.create(createErrorLog(fields))
}

export function updateErrorLog(id, patch) {
  return store.update(id, patch)
}

export function deleteErrorLog(id) {
  store.remove(id)
}

export function archiveErrorLog(id) {
  return store.update(id, { archived: true })
}

export function unarchiveErrorLog(id) {
  return store.update(id, { archived: false })
}

// Logs a new occurrence of an error: bumps recurrenceCount if the same
// description + topic + level already exists, otherwise creates a new entry.
// A resurfacing mistake un-archives the entry — it clearly wasn't mastered.
// Error log entries stay visible across all levels (never filtered out by
// level elsewhere) — `level` here is only used to dedupe correctly, since a
// topicId like "g01" can mean something different in another level's content.
export function recordErrorOccurrence({ description, type, topicId = null, level }) {
  const existing = store.getAll().find(
    e => e.topicId === topicId && e.level === level
      && e.description.trim().toLowerCase() === description.trim().toLowerCase()
  )
  if (existing) {
    return store.update(existing.id, {
      recurrenceCount: existing.recurrenceCount + 1,
      lastOccurrence: nowISO(),
      archived: false,
    })
  }
  return addErrorLog({ description, type, topicId, level })
}

// topicId alone isn't globally unique across levels — pass level when the
// topic being looked up is level-specific (e.g. building a review pool).
export function getErrorLogsByTopic(topicId, level) {
  return store.getAll().filter(e => e.topicId === topicId && (!level || e.level === level))
}

export function getErrorLogsByType(type) {
  return store.getAll().filter(e => e.type === type)
}

export function getActiveErrorLogs() {
  return store.getAll().filter(e => !e.archived)
}

// One-time migration of the older, simpler "banco de erros" entries
// (localStorage key 'ej_erros': {text, category, resolved, createdAt}) into
// the richer error_log entity. Old categories not in ERROR_LOG_TYPES are
// mapped to their closest match. Safe to call on every mount.
export function migrateLegacyErrors() {
  if (localStorage.getItem('ej_erros_migrated')) return
  try {
    const legacy = JSON.parse(localStorage.getItem('ej_erros') || '[]')
    const typeMap = { 'expressões': 'vocabulário', 'escrita': 'gramática', 'outro': 'gramática' }
    legacy.forEach(old => {
      if (!old.text || !old.text.trim()) return
      addErrorLog({
        description: old.text,
        type: typeMap[old.category] || old.category || 'gramática',
        topicId: null,
        recurrenceCount: 1,
        archived: !!old.resolved,
      })
    })
  } catch {}
  localStorage.setItem('ej_erros_migrated', '1')
}

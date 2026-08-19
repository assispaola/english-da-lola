import { createStore } from './storage'
import { createNote } from '../data/schema'

const store = createStore('ej_notes', 'notes')

export const getNotes    = store.getAll
export const getNoteById = store.getById

export function addNote(fields) {
  return store.create(createNote(fields))
}

export function updateNote(id, patch) {
  return store.update(id, patch)
}

export function toggleNoteFavorite(id) {
  const note = store.getById(id)
  if (!note) return null
  return store.update(id, { favorite: !note.favorite })
}

export function deleteNote(id) {
  store.remove(id)
}

// topicId alone isn't globally unique across levels — pass level when the
// topic being looked up is level-specific (e.g. the per-topic note panel).
export function getNotesByTopic(topicId, level) {
  return store.getAll().filter(n => n.topicId === topicId && (!level || n.level === level))
}

export function getLooseNotes() {
  return store.getAll().filter(n => !n.topicId)
}

export function getFavoriteNotes() {
  return store.getAll().filter(n => n.favorite)
}

export function getNotesByTag(tag) {
  return store.getAll().filter(n => (n.tags || []).includes(tag))
}

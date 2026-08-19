// Generic localStorage-backed CRUD store, shared by every data entity.

import { pushCollectionItem, pushCollectionRemove } from './syncEngine'

export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function nowISO() {
  return new Date().toISOString()
}

function readAll(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeAll(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items))
  } catch (err) {
    console.error(`storage write failed for "${key}":`, err)
  }
}

// Creates a set of CRUD functions bound to a single localStorage key.
// `syncName`, when given, is the Firestore collection name this entity
// syncs to (see syncEngine.js) — pass it for user-generated content
// (flashcards, notes, errorLog, attempts, diario, glossario). Omit it for
// content that's re-seeded locally on every device from the app bundle
// (topics, exercises) — that never needs to touch the cloud.
export function createStore(key, syncName) {
  return {
    getAll: () => readAll(key),

    getById: (id) => readAll(key).find(item => item.id === id) || null,

    create: (item) => {
      const items = readAll(key)
      items.unshift(item)
      writeAll(key, items)
      if (syncName) pushCollectionItem(syncName, item)
      return item
    },

    update: (id, patch) => {
      const items = readAll(key)
      let updated = null
      const next = items.map(item => {
        if (item.id !== id) return item
        updated = { ...item, ...patch, id: item.id }
        return updated
      })
      writeAll(key, next)
      if (syncName && updated) pushCollectionItem(syncName, updated)
      return updated
    },

    remove: (id) => {
      const items = readAll(key)
      writeAll(key, items.filter(item => item.id !== id))
      if (syncName) pushCollectionRemove(syncName, id)
    },

    replaceAll: (items) => writeAll(key, items),
  }
}

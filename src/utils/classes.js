import { createStore } from './storage'
import { createClassEntry } from '../data/schema'

const store = createStore('ej_classes', 'classes')

export const getClasses     = store.getAll
export const getClassById   = store.getById

export function addClass(fields) {
  return store.create(createClassEntry(fields))
}

export function updateClass(id, patch) {
  return store.update(id, patch)
}

export function deleteClass(id) {
  store.remove(id)
}

export function getUpcomingClasses(today) {
  return getClasses().filter(c => c.date >= today).sort((a, b) => a.date.localeCompare(b.date))
}

export function getPastClasses(today) {
  return getClasses().filter(c => c.date < today).sort((a, b) => b.date.localeCompare(a.date))
}

// One-time migration of the old single-value "next class" (localStorage key
// ej_next_class, a lone {date, topic, type} object) into the new classes
// list, so whatever was already scheduled isn't lost when this ships.
export function migrateLegacyNextClass() {
  if (localStorage.getItem('ej_next_class_migrated')) return
  try {
    // Only migrate into an empty list — avoids re-creating a duplicate on a
    // second device, where a cloud pull may have already brought the
    // migrated entry down before this flag exists locally.
    if (getClasses().length === 0) {
      const legacy = JSON.parse(localStorage.getItem('ej_next_class') || 'null')
      if (legacy?.date) addClass({ date: legacy.date, topic: legacy.topic || '', type: legacy.type || 'VIP' })
    }
  } catch {}
  localStorage.setItem('ej_next_class_migrated', '1')
}

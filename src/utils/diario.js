import { createStore } from './storage'
import { createDiarioEntry } from '../data/schema'

const store = createStore('ej_diario', 'diario')

export const getDiarioEntries    = store.getAll
export const getDiarioEntryById  = store.getById

export function addDiarioEntry(fields) {
  return store.create(createDiarioEntry(fields))
}

export function updateDiarioEntry(id, patch) {
  return store.update(id, patch)
}

export function deleteDiarioEntry(id) {
  store.remove(id)
}

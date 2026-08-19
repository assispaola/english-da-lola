import { createStore } from './storage'
import { createGlossarioWord } from '../data/schema'
import { DEFAULT_LEVEL } from './levels'

const store = createStore('ej_glossario', 'glossario')

export const getGlossarioWords    = store.getAll
export const getGlossarioWordById = store.getById

export function addGlossarioWord(fields) {
  return store.create(createGlossarioWord(fields))
}

export function updateGlossarioWord(id, patch) {
  return store.update(id, patch)
}

export function deleteGlossarioWord(id) {
  store.remove(id)
}

export function getGlossarioWordsByLevel(level) {
  return store.getAll().filter(w => (w.level || DEFAULT_LEVEL) === level)
}

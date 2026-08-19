import { createStore } from './storage'
import { createFlashcard } from '../data/schema'
import { DEFAULT_LEVEL } from './levels'

const store = createStore('ej_flashcards', 'flashcards')

export const getFlashcards    = store.getAll
export const getFlashcardById = store.getById

export function addFlashcard(fields) {
  return store.create(createFlashcard(fields))
}

export function updateFlashcard(id, patch) {
  return store.update(id, patch)
}

export function deleteFlashcard(id) {
  store.remove(id)
}

export function getFlashcardsByLevel(level) {
  return store.getAll().filter(c => (c.level || DEFAULT_LEVEL) === level)
}

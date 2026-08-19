import { createStore } from './storage'
import { createAttempt } from '../data/schema'
import { DEFAULT_LEVEL } from './levels'

const store = createStore('ej_attempts', 'attempts')

export const getAttempts    = store.getAll
export const getAttemptById = store.getById

export function addAttempt(fields) {
  return store.create(createAttempt(fields))
}

export function deleteAttempt(id) {
  store.remove(id)
}

export function getAttemptsByExercise(exerciseId) {
  return store.getAll().filter(a => a.exerciseId === exerciseId)
}

export function getAttemptsByLevel(level) {
  return store.getAll().filter(a => (a.level || DEFAULT_LEVEL) === level)
}

export function getAccuracyForExercise(exerciseId) {
  const attempts = getAttemptsByExercise(exerciseId)
  if (attempts.length === 0) return null
  const correct = attempts.filter(a => a.correct).length
  return correct / attempts.length
}

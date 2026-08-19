import { createStore } from './storage'
import { createExercise } from '../data/schema'
import { getAttemptsByExercise } from './attempts'
import { DEFAULT_LEVEL } from './levels'

const store = createStore('ej_exercises')

export const getExercises    = store.getAll
export const getExerciseById = store.getById

export function addExercise(fields) {
  return store.create(createExercise(fields))
}

export function updateExercise(id, patch) {
  return store.update(id, patch)
}

export function deleteExercise(id) {
  store.remove(id)
}

// topicId alone isn't globally unique — different levels can reuse short ids
// like "g01" for unrelated topics — so lookups are always (topicId, level) pairs.
export function getExercisesByTopic(topicId, level) {
  return store.getAll().filter(e => e.topicId === topicId && (!level || (e.level || DEFAULT_LEVEL) === level))
}

export function getExercisesByLevel(level) {
  return store.getAll().filter(e => (e.level || DEFAULT_LEVEL) === level)
}

export function getExercisesByType(type) {
  return store.getAll().filter(e => e.type === type)
}

export function getExercisesByDifficulty(difficulty) {
  return store.getAll().filter(e => e.difficulty === difficulty)
}

// Loads seed exercises (e.g. from src/data/exerciseBank.js) into the store,
// skipping any that already exist (matched by topicId + question) so it's
// safe to call every time the practice screen mounts.
export function seedExercisesFromBank(bankItems) {
  const existing = store.getAll()
  const alreadySeeded = (item) =>
    existing.some(e => e.topicId === item.topicId && e.question === item.question)

  bankItems.forEach(item => {
    if (!alreadySeeded(item)) {
      existing.push(store.create(createExercise(item)))
    }
  })
}

// A topic counts as "practiced" once every one of its exercises has at
// least one correct attempt. Shared by Roadmap's progress bar and the
// "first unit completed" achievement.
export function isTopicPracticed(topicId, level) {
  const exs = getExercisesByTopic(topicId, level)
  if (!exs.length) return false
  return exs.every(ex => getAttemptsByExercise(ex.id).some(a => a.correct))
}

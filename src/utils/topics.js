import { createStore } from './storage'
import { createTopic } from '../data/schema'

const store = createStore('ej_topics')

export const getTopics    = store.getAll
export const getTopicById = store.getById

export function addTopic(fields) {
  return store.create(createTopic(fields))
}

export function updateTopic(id, patch) {
  return store.update(id, patch)
}

export function setTopicStatus(id, status) {
  return store.update(id, { status })
}

export function deleteTopic(id) {
  store.remove(id)
}

export function getTopicsByCategory(category) {
  return store.getAll().filter(t => t.category === category)
}

export function getTopicsByStatus(status) {
  return store.getAll().filter(t => t.status === status)
}

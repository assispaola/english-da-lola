import { createStore } from './storage'
import { createSpeakingAssessment } from '../data/schema'

const store = createStore('ej_speaking_assessments', 'speakingAssessments')

export const getSpeakingAssessments = store.getAll

export function addSpeakingAssessment(fields) {
  return store.create(createSpeakingAssessment(fields))
}

// topicId alone isn't globally unique across levels — pass level when
// looking up a specific topic's history.
export function getAssessmentsByTopic(topicId, level) {
  return store.getAll()
    .filter(a => a.topicId === topicId && (!level || a.level === level))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

export const RATING_META = [
  { id: 'facil',   emoji: '😊', label: 'Fácil' },
  { id: 'medio',   emoji: '😐', label: 'Consegui, com dificuldade' },
  { id: 'dificil', emoji: '😣', label: 'Difícil, preciso revisar' },
]

export function ratingEmoji(rating) {
  return RATING_META.find(r => r.id === rating)?.emoji || '❔'
}

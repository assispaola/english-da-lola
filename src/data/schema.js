// Shape definitions (enums + factory functions) for the app's core study entities:
// Topic, Exercise, Attempt, ErrorLog, Note, Flashcard, DiarioEntry, GlossarioWord.
// These are plain-object factories, not classes — storage is handled by src/utils/storage.js.
//
// `level` (CEFR: A1/A2/B1/B2/C1/C2, see src/utils/levels.js) marks which content
// tier an entity belongs to. Topics/exercises/flashcards/glossário are hard-scoped
// by level (the current level decides what's shown). Attempts carry a denormalized
// `level` too, so XP/badges can be computed per level without joining exercises.
// Notes/errorLog/diário carry `level` only for reference/labeling — they stay
// visible across all levels, never filtered out.

import { genId, nowISO } from '../utils/storage'
import { DEFAULT_LEVEL } from '../utils/levels'

export const TOPIC_CATEGORIES = ['gramática', 'vocabulário', 'leitura', 'fala']

export const TOPIC_STATUS = ['não iniciado', 'em progresso', 'concluído']

export const EXERCISE_TYPES = [
  'multipla-escolha', 'fill-blank', 'reorder', 'matching', 'correction', 'listening',
]

export const EXERCISE_DIFFICULTIES = [1, 2, 3]

export const ERROR_LOG_TYPES = ['gramática', 'vocabulário', 'pronúncia']

export function createTopic({
  name,
  category = TOPIC_CATEGORIES[0],
  status = TOPIC_STATUS[0],
  unit = '',
  noteId = null,
  level = DEFAULT_LEVEL,
} = {}) {
  return {
    id: genId(),
    name,
    category,
    status,
    unit,
    noteId,
    level,
    createdAt: nowISO(),
  }
}

export function createExercise({
  topicId,
  type = EXERCISE_TYPES[0],
  question,
  options = [],
  correctAnswer,
  difficulty = 1,
  explanation = '',
  level = DEFAULT_LEVEL,
} = {}) {
  return {
    id: genId(),
    topicId,
    type,
    question,
    options,
    correctAnswer,
    difficulty,
    explanation,
    level,
    createdAt: nowISO(),
  }
}

export function createAttempt({
  exerciseId,
  userAnswer,
  correct = false,
  level = DEFAULT_LEVEL,
} = {}) {
  return {
    id: genId(),
    exerciseId,
    userAnswer,
    correct,
    level,
    timestamp: nowISO(),
  }
}

export function createErrorLog({
  description,
  type = ERROR_LOG_TYPES[0],
  topicId = null,
  recurrenceCount = 1,
  archived = false,
  level = DEFAULT_LEVEL,
} = {}) {
  return {
    id: genId(),
    description,
    type,
    topicId,
    recurrenceCount,
    archived,
    level,
    lastOccurrence: nowISO(),
  }
}

export function createNote({
  topicId = null,
  content = '',
  tags = [],
  favorite = false,
  level = DEFAULT_LEVEL,
} = {}) {
  return {
    id: genId(),
    topicId,
    content,
    tags,
    favorite,
    level,
    timestamp: nowISO(),
  }
}

export function createFlashcard({
  front,
  back,
  category = 'vocabulário',
  reviewCount = 0,
  lastReview = null,
  confidence = null,
  masteredStreak = 0,
  mastered = false,
  level = DEFAULT_LEVEL,
} = {}) {
  return {
    id: genId(),
    front,
    back,
    category,
    reviewCount,
    lastReview,
    confidence,
    masteredStreak,
    mastered,
    level,
    createdAt: nowISO(),
  }
}

export function createDiarioEntry({
  date,
  content = '',
  corrections = '',
  grammarErrors = [],
  vocabSuggestions = [],
  naturalPhrases = [],
  level = DEFAULT_LEVEL,
} = {}) {
  return {
    id: genId(),
    date,
    content,
    corrections,
    grammarErrors,
    vocabSuggestions,
    naturalPhrases,
    level,
    createdAt: nowISO(),
  }
}

export function createGlossarioWord({
  word,
  pronunciation = '',
  example = '',
  category = 'substantivo',
  unit = '1A',
  level = DEFAULT_LEVEL,
} = {}) {
  return {
    id: genId(),
    word,
    pronunciation,
    example,
    category,
    unit,
    level,
    createdAt: nowISO(),
  }
}

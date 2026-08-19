// Builds spaced-repetition-ish review queues from active (non-archived)
// error_log entries. Shared by Praticar's "revisão rápida" and BancoDeErros'
// "gerar quiz de revisão" so both features rank topics the same way.

import { getActiveErrorLogs } from './errorLog'
import { getExercisesByTopic } from './exercises'
import { getAttemptsByExercise } from './attempts'
import { shuffle } from './exerciseEngine'
import { getRoadmapForLevel, findRoadmapTopic } from '../data/roadmapData'
import { DEFAULT_LEVEL } from './levels'

// Reincident + recent errors score higher: recurrenceCount is the base
// weight, boosted up to 2x for mistakes made within the last 7 days.
function reviewScore(log) {
  const daysSince    = (Date.now() - new Date(log.lastOccurrence).getTime()) / 86_400_000
  const recencyBoost = Math.max(0, 7 - daysSince) / 7 // 1.0 (hoje) → 0 (7+ dias atrás)
  return log.recurrenceCount * (1 + recencyBoost)
}

// Topic ids ranked by how much review they need, most urgent first. Error
// log entries stay visible across all levels, so this filters down to the
// level currently being practiced before ranking.
export function getTopicsNeedingReview(level = DEFAULT_LEVEL) {
  const scoreByTopic = new Map()
  getActiveErrorLogs().forEach(log => {
    if (!log.topicId || (log.level || DEFAULT_LEVEL) !== level) return
    scoreByTopic.set(log.topicId, (scoreByTopic.get(log.topicId) || 0) + reviewScore(log))
  })
  return [...scoreByTopic.entries()].sort((a, b) => b[1] - a[1]).map(([topicId]) => topicId)
}

export function buildReviewPool({ targetTotal = 10, perTopic = 4, level = DEFAULT_LEVEL } = {}) {
  const pool = []
  for (const topicId of getTopicsNeedingReview(level)) {
    if (pool.length >= targetTotal) break
    pool.push(...shuffle(getExercisesByTopic(topicId, level)).slice(0, perTopic))
  }
  return shuffle(pool).slice(0, targetTotal)
}

// What to review before the next VIP class: topics with pending errors come
// first (most urgent), then topics whose exercises are least practiced.
export function getVipSuggestions(level = DEFAULT_LEVEL, limit = 3) {
  const seen = new Set()
  const ranked = []

  getTopicsNeedingReview(level).forEach(topicId => {
    if (seen.has(topicId)) return
    seen.add(topicId); ranked.push(topicId)
  })

  const practiceRatios = []
  Object.values(getRoadmapForLevel(level)).flat().forEach(item => {
    const exs = getExercisesByTopic(item.id, level)
    if (!exs.length) return
    const done = exs.filter(ex => getAttemptsByExercise(ex.id).length > 0).length
    practiceRatios.push({ topicId: item.id, ratio: done / exs.length })
  })
  practiceRatios.sort((a, b) => a.ratio - b.ratio)
  practiceRatios.forEach(({ topicId }) => {
    if (seen.has(topicId)) return
    seen.add(topicId); ranked.push(topicId)
  })

  return ranked.slice(0, limit).map(id => findRoadmapTopic(id, level)).filter(Boolean)
}

// Simple, discreet gamification layer — derived entirely from existing data
// (attempts, exercises, roadmap), no separate write-side bookkeeping needed.
//
// XP, badges and the roadmap % are all computed per CEFR level (see
// src/utils/levels.js) — practicing A2 doesn't inflate your A1 numbers.
// The streak is the one exception: studying in ANY level keeps it alive,
// per the product decision that "estudar em qualquer nível conta".

import { getAttempts, getAttemptsByLevel } from './attempts'
import { getExerciseById, isTopicPracticed } from './exercises'
import { getRoadmapForLevel } from '../data/roadmapData'
import { DEFAULT_LEVEL } from './levels'

const XP_BY_DIFFICULTY = { 1: 10, 2: 20, 3: 30 }
const XP_PER_LEVEL = 100

// ─── Streak (days with at least one exercise attempt, any CEFR level) ──

export function getExerciseDates() {
  const dates = new Set()
  getAttempts().forEach(a => dates.add(a.timestamp.split('T')[0]))
  return dates
}

export function getExerciseStreak() {
  const dates = getExerciseDates()
  if (dates.size === 0) return 0
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    if (dates.has(d.toISOString().split('T')[0])) streak++
    else break
  }
  return streak
}

// ─── XP & level-up (every correct exercise attempt earns points, scaled by
// difficulty; leveling up is a flat 100 XP per tier, kept simple on purpose).
// "level" in getLevelInfo() means game-level (1, 2, 3...), NOT the CEFR
// level — those are unrelated concepts that happen to share the word.

export function getTotalXP(cefrLevel = DEFAULT_LEVEL) {
  return getAttemptsByLevel(cefrLevel)
    .filter(a => a.correct)
    .reduce((sum, a) => {
      const difficulty = getExerciseById(a.exerciseId)?.difficulty || 1
      return sum + (XP_BY_DIFFICULTY[difficulty] || XP_BY_DIFFICULTY[1])
    }, 0)
}

export function getLevelInfo(xp) {
  const level      = Math.floor(xp / XP_PER_LEVEL) + 1
  const xpIntoLevel = xp % XP_PER_LEVEL
  return { level, xpIntoLevel, xpForNext: XP_PER_LEVEL, pct: Math.round((xpIntoLevel / XP_PER_LEVEL) * 100) }
}

// ─── Badges (per CEFR level, except the streak-based one) ───────────────

function getCompletedTopicsCount(cefrLevel) {
  try {
    const rm = JSON.parse(localStorage.getItem(`ej_roadmap__${cefrLevel}`)) || getRoadmapForLevel(cefrLevel)
    let count = 0
    Object.values(rm).forEach(items => items.forEach(item => {
      if (item.status === 'Concluído' || isTopicPracticed(item.id, cefrLevel)) count++
    }))
    return count
  } catch {
    return 0
  }
}

export function getBadges(cefrLevel = DEFAULT_LEVEL) {
  return [
    { id: 'first_unit',      label: 'primeira unidade concluída', icon: '🎯', unlocked: getCompletedTopicsCount(cefrLevel) >= 1 },
    { id: 'fifty_exercises', label: '50 exercícios feitos',        icon: '💯', unlocked: getAttemptsByLevel(cefrLevel).length >= 50 },
    { id: 'week_streak',     label: '7 dias de streak',            icon: '🔥', unlocked: getExerciseStreak() >= 7 },
  ]
}

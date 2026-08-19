// CEFR level config + the "which level am I looking at" context, shared by
// every screen that shows level-scoped content (roadmap, exercises, flashcards,
// glossário, XP/badges). Notes/errors/diário stay visible across all levels —
// they just carry a `level` tag for reference, so they don't read this context
// to decide what to show, only to label things.
//
// Levels unlock automatically: a level becomes available only once the
// PREVIOUS level's roadmap is 100% complete in every category (not just the
// overall average). A1 is always unlocked. Locked levels stay visible in the
// selector (with a lock + "how much is missing" hint), never hidden.

import { createContext, useContext, useCallback, useEffect, useState, createElement } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getRoadmapForLevel } from '../data/roadmapData'
import { isTopicPracticed } from './exercises'
import { pushProfile } from './syncEngine'

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
export const DEFAULT_LEVEL = 'A1'

const LevelContext = createContext(null)

// % of a level's roadmap done, and whether EVERY category (not just the
// average) has hit 100% — that's what actually gates the next level.
export function getRoadmapCompletion(level) {
  let rm
  try {
    rm = JSON.parse(localStorage.getItem(`ej_roadmap__${level}`)) || getRoadmapForLevel(level)
  } catch {
    rm = getRoadmapForLevel(level)
  }
  const categories = Object.entries(rm)
  if (!categories.length) return { pct: 0, complete: false }

  let totalAll = 0, doneAll = 0, allCategoriesComplete = true
  categories.forEach(([, items]) => {
    const total = items.length
    const done = items.filter(i => i.status === 'Concluído' || isTopicPracticed(i.id, level)).length
    totalAll += total; doneAll += done
    if (total === 0 || done < total) allCategoriesComplete = false
  })
  return {
    pct: totalAll > 0 ? Math.round((doneAll / totalAll) * 100) : 0,
    complete: allCategoriesComplete,
  }
}

export function isLevelUnlockedNow(level) {
  const idx = LEVELS.indexOf(level)
  if (idx <= 0) return true // A1 always unlocked
  return getRoadmapCompletion(LEVELS[idx - 1]).complete
}

export function LevelProvider({ children }) {
  const [currentLevel, setCurrentLevelRaw] = useLocalStorage('ej_current_level', DEFAULT_LEVEL)
  const [unlockedLevels, setUnlockedLevels] = useLocalStorage('ej_levels_unlocked', [DEFAULT_LEVEL])
  const [justUnlocked, setJustUnlocked] = useState(null)

  // Re-derives which levels are unlocked from actual roadmap progress.
  // Anything newly unlocked (not already in the stored list) triggers the
  // one-time celebration toast — call this after any action that could
  // move a roadmap to 100% (manual status cycle, practicing exercises).
  const checkUnlocks = useCallback(() => {
    const nowUnlocked = LEVELS.filter(isLevelUnlockedNow)
    const newlyFound = nowUnlocked.filter(l => !unlockedLevels.includes(l))
    if (newlyFound.length) {
      setUnlockedLevels(nowUnlocked)
      setJustUnlocked(newlyFound[0])
      pushProfile({ levels_unlocked: nowUnlocked })
    }
    return newlyFound
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlockedLevels])

  useEffect(() => { checkUnlocks() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const clearJustUnlocked = useCallback(() => setJustUnlocked(null), [])

  // Locked levels simply can't be switched into.
  const setCurrentLevel = useCallback((level) => {
    if (!LEVELS.includes(level)) return
    if (!unlockedLevels.includes(level)) return
    setCurrentLevelRaw(level)
    pushProfile({ current_level: level })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlockedLevels])

  const value = { currentLevel, setCurrentLevel, unlockedLevels, checkUnlocks, justUnlocked, clearJustUnlocked }
  return createElement(LevelContext.Provider, { value }, children)
}

export function useLevel() {
  const ctx = useContext(LevelContext)
  if (!ctx) throw new Error('useLevel() must be used inside <LevelProvider>')
  return ctx
}
